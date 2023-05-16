declare module 'hsluv' {
  export class Hsluv {
    hsluv_h: number;
    hsluv_s: number;
    hsluv_l: number;

    rgb_r: number;
    rgb_g: number;
    rgb_b: number;

    hsluvToRgb: () => void;
    rgbToHsluv: () => void;
  }
}
