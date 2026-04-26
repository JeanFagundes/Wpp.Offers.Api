import { MessageGateway } from "../../application/contracts/message-gateway";
import { AppError } from "../../shared/errors/app-error";
import { env } from "../config/env";
import { logger } from "../logging/logger";
import { WppSessionManager } from "./session-manager";
import type { SessionConfig, SessionState } from "./types";

export type AuthCodeDetailedResult = SessionState & {
  ready: boolean;
  code: string | null;
  phoneNumber: string | null;
  lastResponse: {
    status: string;
    session: string;
    hasClient: boolean;
    hasCode: boolean;
    lastError: string | null;
    nextRetryAt: string | null;
  };
};

export class WppConnectClient implements MessageGateway {
  private readonly sessionManager = new WppSessionManager({
    headless: env.WPP_HEADLESS,
    useChrome: true,
    debug: false,
    logQR: env.WPP_LOG_QR,
    autoClose: 0,
    folderNameToken: env.WPP_TOKEN_DIR,
    tokenStore: "file",
    saveQrToDisk: env.WPP_SAVE_QR_IMAGE,
    qrOutputDir: env.WPP_QR_DIR,
    ...(env.WPP_AUTH_METHOD === "code" && env.WPP_PHONE_NUMBER
      ? { phoneNumber: env.WPP_PHONE_NUMBER }
      : {}),
  });

  async initialize(): Promise<void> {
    if (!env.WPP_START_SESSION_ON_BOOT) return;
    const bootSessions = this.resolveBootSessions();
    await this.sessionManager.initSessions(bootSessions);
    logger.info("WPP sessions initialized on boot.", {
      sessions: bootSessions.map((session) => session.session),
    });
  }

  async initSession(config: SessionConfig): Promise<void> {
    await this.sessionManager.initSession(config);
  }

  startPhoneWatchdog(session = env.WPP_SESSION_NAME, intervalMs?: number): void {
    this.sessionManager.startPhoneWatchdog(session, intervalMs);
  }

  stopPhoneWatchdog(session = env.WPP_SESSION_NAME): void {
    this.sessionManager.stopPhoneWatchdog(session);
  }

  async sendText(recipientId: string, message: string): Promise<void> {
    await this.sessionManager.initSession({ session: env.WPP_SESSION_NAME });
    const client = this.sessionManager.getClient(env.WPP_SESSION_NAME);
    const normalizedRecipientId = this.normalizeRecipientId(recipientId);

    if (!client) {
      throw new AppError("Sessao do WhatsApp ainda nao autenticada. Use o codigo de pareamento primeiro.", 409);
    }

    await client.sendText(normalizedRecipientId, message);
  }

  async getSessionStatus(): Promise<AuthCodeDetailedResult["lastResponse"]> {
    const sessionState = this.sessionManager.getState(env.WPP_SESSION_NAME);
    return {
      status: sessionState?.status ?? "notInitialized",
      session: env.WPP_SESSION_NAME,
      hasClient: Boolean(this.sessionManager.getClient(env.WPP_SESSION_NAME)),
      hasCode: Boolean(sessionState?.lastLinkCode),
      lastError: sessionState?.lastError ?? null,
      nextRetryAt: null,
    };
  }

  async getAuthCode(): Promise<{ code: string; raw: AuthCodeDetailedResult["lastResponse"] }> {
    const details = await this.getAuthCodeDetailed();

    if (!details.code) {
      throw new AppError("Codigo de pareamento ainda nao foi capturado pela lib WPPConnect.", 409);
    }

    return {
      code: details.code,
      raw: details.lastResponse,
    };
  }

  async getAuthCodeDetailed(): Promise<AuthCodeDetailedResult> {
    await this.sessionManager.initSession({ session: env.WPP_SESSION_NAME });
    const sessionState = this.sessionManager.getState(env.WPP_SESSION_NAME);
    const status = await this.getSessionStatus();

    if (!sessionState) {
      throw new AppError("Sessao ainda nao inicializada.", 409);
    }

    return {
      ...sessionState,
      ready: Boolean(sessionState.lastLinkCode),
      code: sessionState.lastLinkCode ?? null,
      phoneNumber: env.WPP_PHONE_NUMBER ?? null,
      lastResponse: status,
    };
  }

  private resolveBootSessions(): SessionConfig[] {
    const sessions = env.WPP_SESSIONS.split(",")
      .map((session) => session.trim())
      .filter(Boolean);

    if (!sessions.length) {
      return [{ session: env.WPP_SESSION_NAME }];
    }

    return sessions.map((session) => ({ session }));
  }

  private normalizeRecipientId(recipientId: string): string {
    if (recipientId.endsWith("@g.us") || recipientId.endsWith("@c.us")) {
      return recipientId;
    }

    const digits = recipientId.replace(/\D/g, "");
    return `${digits}@c.us`;
  }
}
