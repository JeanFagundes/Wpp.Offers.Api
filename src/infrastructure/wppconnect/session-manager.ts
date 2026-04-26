import * as wppconnect from "@wppconnect-team/wppconnect";
import type { CreateOptions, Whatsapp } from "@wppconnect-team/wppconnect";
import { AppError } from "../../shared/errors/app-error";
import { logger } from "../logging/logger";
import { QrCodeExporter } from "./qr-code-exporter";
import { SessionStatusHandler } from "./status-handler";
import type { SessionConfig, SessionMap, SessionRuntime, SessionState } from "./types";

type SessionResolvedConfig = {
  session: string;
  headless: boolean;
  useChrome: boolean;
  debug: boolean;
  logQR: boolean;
  autoClose: number;
  folderNameToken: string;
  phoneNumber?: string;
  tokenStore?: SessionConfig["tokenStore"];
  saveQrToDisk?: boolean;
  qrOutputDir?: string;
};

export class WppSessionManager {
  private readonly sessions: SessionMap = new Map();
  private readonly initializing = new Map<string, Promise<Whatsapp>>();
  private readonly statusHandler = new SessionStatusHandler();
  private readonly qrExporter = new QrCodeExporter();

  constructor(private readonly defaultConfig: Omit<SessionResolvedConfig, "session">) {}

  async initSession(config: SessionConfig): Promise<Whatsapp> {
    const merged = this.mergeConfig(config);
    const existing = this.sessions.get(merged.session);
    if (existing) return existing.client;

    const runningInit = this.initializing.get(merged.session);
    if (runningInit) return runningInit;

    const bootPromise = this.createSession(merged).finally(() => {
      this.initializing.delete(merged.session);
    });
    this.initializing.set(merged.session, bootPromise);
    return bootPromise;
  }

  async initSessions(configs: SessionConfig[]): Promise<void> {
    await Promise.all(configs.map((cfg) => this.initSession(cfg)));
  }

  getClient(session: string): Whatsapp | null {
    return this.sessions.get(session)?.client ?? null;
  }

  getState(session: string): SessionState | null {
    return this.sessions.get(session)?.state ?? null;
  }

  getStates(): SessionState[] {
    return Array.from(this.sessions.values()).map((runtime) => runtime.state);
  }

  startPhoneWatchdog(session: string, intervalMs?: number): void {
    const client = this.getClientOrThrow(session);
    if (typeof intervalMs === "number") {
      client.startPhoneWatchdog(intervalMs);
      logger.info("Phone watchdog started with custom interval.", { session, intervalMs });
      return;
    }

    client.startPhoneWatchdog();
    logger.info("Phone watchdog started with default interval.", { session });
  }

  stopPhoneWatchdog(session: string): void {
    const client = this.getClientOrThrow(session);
    void client.stopPhoneWatchdog(0);
    logger.info("Phone watchdog stopped.", { session });
  }

  private async createSession(config: SessionResolvedConfig): Promise<Whatsapp> {
    const state: SessionState = {
      session: config.session,
      status: "initializing",
      attempts: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const options: CreateOptions = {
      session: config.session,
      headless: config.headless,
      useChrome: config.useChrome,
      debug: config.debug,
      logQR: config.logQR,
      autoClose: config.autoClose,
      folderNameToken: config.folderNameToken,
      ...(config.phoneNumber ? { phoneNumber: config.phoneNumber } : {}),
      ...(config.tokenStore ? { tokenStore: config.tokenStore } : {}),
      catchQR: async (base64Qrimg, asciiQR, attempts, urlCode) => {
        this.statusHandler.trackQrAttempt(state, base64Qrimg);
        logger.info("QR captured.", { session: config.session, attempts, urlCode });
        if (config.logQR) {
          logger.info("QR (ASCII) generated.", { session: config.session });
          if (asciiQR?.trim()) {
            // Print raw ASCII QR in terminal so it can be scanned directly.
            console.log(`\n${asciiQR}\n`);
          } else {
            logger.warn("ASCII QR came empty.", { session: config.session });
          }
        }

        if (config.saveQrToDisk && config.qrOutputDir) {
          try {
            const filePath = await this.qrExporter.saveBase64QrAsPng(
              config.session,
              base64Qrimg,
              config.qrOutputDir,
            );
            logger.info("QR saved to disk.", { session: config.session, filePath });
          } catch (error) {
            this.statusHandler.trackError(state, error);
            logger.warn("Failed to save QR image.", { session: config.session, error });
          }
        }
      },
      catchLinkCode: (code) => {
        this.statusHandler.trackLinkCode(state, code);
        logger.info("Link code captured.", { session: config.session, code });
      },
      statusFind: (statusSession, session) => {
        this.statusHandler.updateStatus(state, statusSession);
        logger.info("Detailed session status callback.", { session, statusSession });
      },
    };

    try {
      const client = await wppconnect.create(options);
      const runtime: SessionRuntime = { client, config, state };
      this.sessions.set(config.session, runtime);
      this.statusHandler.updateStatus(state, "isLogged");
      logger.info("WPP session initialized successfully.", { session: config.session });
      return client;
    } catch (error) {
      this.statusHandler.trackError(state, error);
      this.statusHandler.updateStatus(state, "startupError");
      logger.error("Failed to initialize WPP session.", { session: config.session, error });
      throw new AppError(`Falha ao iniciar sessao '${config.session}'.`, 500);
    }
  }

  private getClientOrThrow(session: string): Whatsapp {
    const client = this.getClient(session);
    if (!client) {
      throw new AppError(`Sessao '${session}' nao inicializada.`, 409);
    }
    return client;
  }

  private mergeConfig(config: SessionConfig): SessionResolvedConfig {
    return {
      ...this.defaultConfig,
      ...config,
      session: config.session,
    };
  }
}
