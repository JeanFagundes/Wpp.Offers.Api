import { logger } from "../logging/logger";
import type { SessionState, SessionStatus } from "./types";

export class SessionStatusHandler {
  updateStatus(state: SessionState, status: SessionStatus): void {
    state.status = status;
    state.updatedAt = new Date().toISOString();
    logger.info("WPP session status changed.", { session: state.session, status });
  }

  trackQrAttempt(state: SessionState, qrCode: string): void {
    state.attempts += 1;
    state.lastQrCode = qrCode;
    state.updatedAt = new Date().toISOString();
  }

  trackLinkCode(state: SessionState, linkCode: string): void {
    state.lastLinkCode = linkCode;
    state.updatedAt = new Date().toISOString();
  }

  trackError(state: SessionState, error: unknown): void {
    state.lastError = error instanceof Error ? error.message : String(error);
    state.updatedAt = new Date().toISOString();
  }
}
