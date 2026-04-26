import { env } from "../config/env";
import { WppSessionManager } from "./session-manager";

async function runMultiSessionExample(): Promise<void> {
  const manager = new WppSessionManager({
    headless: env.WPP_HEADLESS,
    useChrome: true,
    debug: false,
    logQR: true,
    autoClose: 0,
    folderNameToken: env.WPP_TOKEN_DIR,
    tokenStore: "file",
    saveQrToDisk: true,
    qrOutputDir: env.WPP_QR_DIR,
  });

  await manager.initSessions([
    { session: "sales", phoneNumber: "5511999999999" },
    { session: "support", phoneNumber: "5511888888888" },
  ]);

  manager.startPhoneWatchdog("sales");
  manager.startPhoneWatchdog("support", 30000);
}

void runMultiSessionExample();
