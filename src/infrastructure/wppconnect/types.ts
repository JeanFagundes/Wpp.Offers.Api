import type { CreateOptions, Whatsapp } from "@wppconnect-team/wppconnect";

export const KNOWN_SESSION_STATUSES = [
  "isLogged",
  "notLogged",
  "browserClose",
  "qrReadSuccess",
  "qrReadFail",
  "autocloseCalled",
  "desconnectedMobile",
  "serverClose",
  "deleteToken",
] as const;

export type KnownSessionStatus = (typeof KNOWN_SESSION_STATUSES)[number];

export type SessionStatus = KnownSessionStatus | string;

export type SessionConfig = {
  session: string;
  phoneNumber?: string;
  headless?: boolean;
  useChrome?: boolean;
  debug?: boolean;
  logQR?: boolean;
  autoClose?: number;
  folderNameToken?: string;
  tokenStore?: CreateOptions["tokenStore"];
  saveQrToDisk?: boolean;
  qrOutputDir?: string;
};

export type SessionState = {
  session: string;
  status: SessionStatus;
  attempts: number;
  lastQrCode?: string;
  lastLinkCode?: string;
  lastError?: string;
  startedAt?: string;
  updatedAt: string;
};

export type SessionRuntime = {
  client: Whatsapp;
  config: SessionConfig;
  state: SessionState;
};

export type SessionMap = Map<string, SessionRuntime>;
