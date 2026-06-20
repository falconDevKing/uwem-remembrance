import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";

const TEMPLATE_PATH = join(process.cwd(), "src", "lib", "invite-template.jpeg");

const QR_CODE_SIZE = 128;
const QR_CODE_TOP = 714;

const NAME_TOP = 870;
const NAME_FONT_SIZE = 28;
const NAME_COLOR = "#4a3520";

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function generateInviteImage(guestName: string, verificationUrl: string): Promise<Buffer> {
  const templateBuffer = await readFile(TEMPLATE_PATH);
  const meta = await sharp(templateBuffer).metadata();
  const templateWidth = meta.width!;

  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    type: "png",
    width: QR_CODE_SIZE,
    margin: 1,
    color: { dark: "#2d2a26", light: "#00000000" },
    errorCorrectionLevel: "M",
  });

  const nameText = escapeXml(guestName.toUpperCase());
  const nameSvg = Buffer.from(
    `<svg width="${templateWidth}" height="60">
      <text
        x="${templateWidth / 2}"
        y="40"
        font-family="serif"
        font-size="${NAME_FONT_SIZE}"
        font-weight="bold"
        fill="${NAME_COLOR}"
        text-anchor="middle"
      >${nameText}</text>
    </svg>`,
  );

  const qrLeft = Math.round((templateWidth - QR_CODE_SIZE) / 2) - 4;

  const result = await sharp(templateBuffer)
    .composite([
      { input: qrBuffer, top: QR_CODE_TOP, left: qrLeft },
      { input: nameSvg, top: NAME_TOP, left: 0 },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return result;
}
