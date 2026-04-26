import fs from "fs";
import path from "path";

export class QrCodeExporter {
  async saveBase64QrAsPng(session: string, base64Qr: string, outputDir: string): Promise<string> {
    const match = base64Qr.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!match || match.length !== 3 || !match[1] || !match[2]) {
      throw new Error("Invalid base64 QR input");
    }

    const mimeType = match[1];
    const encodedData = match[2];
    if (!mimeType.includes("image")) {
      throw new Error(`Unsupported QR mime type: ${mimeType}`);
    }

    const buffer = Buffer.from(encodedData, "base64");
    const dir = path.resolve(process.cwd(), outputDir);
    await fs.promises.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${session}.png`);
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }
}
