declare module "opentype.js" {
  export interface Font {
    getPath(text: string, x: number, y: number, fontSize: number): Path;
    names: { fontFamily?: string };
  }

  export interface Path {
    commands: PathCommand[];
    getBoundingBox(): BoundingBox;
  }

  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export type PathCommand =
    | { type: "M"; x: number; y: number }
    | { type: "L"; x: number; y: number }
    | { type: "Q"; x: number; y: number; x1: number; y1: number }
    | { type: "C"; x: number; y: number; x1: number; y1: number; x2: number; y2: number }
    | { type: "Z" };

  export function parse(buffer: ArrayBuffer): Font;
  export function load(path: string): Promise<Font>;
}
