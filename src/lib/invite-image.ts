import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Jimp } from "jimp";
import QRCode from "qrcode";
import * as opentype from "opentype.js";

const TEMPLATE_PATH = join(process.cwd(), "src", "lib", "invite-template.jpeg");
const FONT_PATH = join(process.cwd(), "src", "lib", "fonts", "EBGaramond.ttf");

const QR_CODE_SIZE = 128;
const QR_CODE_TOP = 714;
const NAME_TOP = 884;
const NAME_FONT_SIZE = 32;
const NAME_COLOR = 0x4a3520ff;

let cachedFont: opentype.Font | null = null;
function getFont(): opentype.Font {
  if (!cachedFont) {
    const buffer = readFileSync(FONT_PATH);
    cachedFont = opentype.parse(buffer.buffer as ArrayBuffer);
  }
  return cachedFont;
}

function renderTextToImage(text: string, fontSize: number, color: number): { image: InstanceType<typeof Jimp>; width: number; height: number } {
  const font = getFont();
  const path = font.getPath(text, 0, fontSize, fontSize);
  const bbox = path.getBoundingBox();

  const padding = 4;
  const width = Math.ceil(bbox.x2 - bbox.x1) + padding * 2;
  const height = Math.ceil(bbox.y2 - bbox.y1) + padding * 2;
  const offsetX = -Math.floor(bbox.x1) + padding;
  const offsetY = -Math.floor(bbox.y1) + padding;

  const img = new Jimp({ width, height, color: 0x00000000 });

  const correctedPath = font.getPath(text, offsetX, offsetY + fontSize, fontSize);

  const commands = correctedPath.commands;
  const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  let cx = 0;
  let cy = 0;

  for (const cmd of commands) {
    if (cmd.type === "M") {
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === "L") {
      segments.push({ x1: cx, y1: cy, x2: cmd.x, y2: cmd.y });
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === "Q") {
      const steps = 8;
      for (let t = 0; t < steps; t++) {
        const t0 = t / steps;
        const t1 = (t + 1) / steps;
        const ax = (1 - t0) * (1 - t0) * cx + 2 * (1 - t0) * t0 * cmd.x1 + t0 * t0 * cmd.x;
        const ay = (1 - t0) * (1 - t0) * cy + 2 * (1 - t0) * t0 * cmd.y1 + t0 * t0 * cmd.y;
        const bx = (1 - t1) * (1 - t1) * cx + 2 * (1 - t1) * t1 * cmd.x1 + t1 * t1 * cmd.x;
        const by = (1 - t1) * (1 - t1) * cy + 2 * (1 - t1) * t1 * cmd.y1 + t1 * t1 * cmd.y;
        segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
      }
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === "C") {
      const steps = 12;
      for (let t = 0; t < steps; t++) {
        const t0 = t / steps;
        const t1 = (t + 1) / steps;
        const ax = (1 - t0) ** 3 * cx + 3 * (1 - t0) ** 2 * t0 * cmd.x1 + 3 * (1 - t0) * t0 ** 2 * cmd.x2 + t0 ** 3 * cmd.x;
        const ay = (1 - t0) ** 3 * cy + 3 * (1 - t0) ** 2 * t0 * cmd.y1 + 3 * (1 - t0) * t0 ** 2 * cmd.y2 + t0 ** 3 * cmd.y;
        const bx = (1 - t1) ** 3 * cx + 3 * (1 - t1) ** 2 * t1 * cmd.x1 + 3 * (1 - t1) * t1 ** 2 * cmd.x2 + t1 ** 3 * cmd.x;
        const by = (1 - t1) ** 3 * cy + 3 * (1 - t1) ** 2 * t1 * cmd.y1 + 3 * (1 - t1) * t1 ** 2 * cmd.y2 + t1 ** 3 * cmd.y;
        segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
      }
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === "Z") {
      // close path
    }
  }

  // Scanline fill using even-odd rule
  for (let y = 0; y < height; y++) {
    const intersections: number[] = [];
    const scanY = y + 0.5;
    for (const seg of segments) {
      const { x1, y1, x2, y2 } = seg;
      if ((y1 <= scanY && y2 > scanY) || (y2 <= scanY && y1 > scanY)) {
        const t = (scanY - y1) / (y2 - y1);
        intersections.push(x1 + t * (x2 - x1));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length - 1; i += 2) {
      const xStart = Math.max(0, Math.ceil(intersections[i]));
      const xEnd = Math.min(width - 1, Math.floor(intersections[i + 1]));
      for (let x = xStart; x <= xEnd; x++) {
        img.setPixelColor(color, x, y);
      }
    }
  }

  // Dilate 1px to simulate bold weight
  const dilated = new Jimp({ width, height, color: 0x00000000 });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (img.getPixelColor(x, y) !== 0x00000000) {
        dilated.setPixelColor(color, x, y);
        if (x > 0) dilated.setPixelColor(color, x - 1, y);
        if (x < width - 1) dilated.setPixelColor(color, x + 1, y);
      }
    }
  }

  return { image: dilated, width, height };
}

export async function generateInviteImage(guestName: string, verificationUrl: string): Promise<Buffer> {
  const templateBuffer = readFileSync(TEMPLATE_PATH);
  const template = await Jimp.fromBuffer(templateBuffer);
  const templateWidth = template.width;

  const qrPng = await QRCode.toBuffer(verificationUrl, {
    type: "png",
    width: QR_CODE_SIZE,
    margin: 1,
    color: { dark: "#2d2a26", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
  const qrImage = await Jimp.fromBuffer(qrPng);
  const qrLeft = Math.round((templateWidth - QR_CODE_SIZE) / 2) - 4;
  template.composite(qrImage, qrLeft, QR_CODE_TOP);

  const nameText = guestName.toUpperCase();
  const { image: nameImage, width: nameWidth } = renderTextToImage(nameText, NAME_FONT_SIZE, NAME_COLOR);
  const nameLeft = Math.round((templateWidth - nameWidth) / 2);
  template.composite(nameImage, nameLeft, NAME_TOP);

  const outputBuffer = await template.getBuffer("image/jpeg", { quality: 90 });
  return Buffer.from(outputBuffer);
}
