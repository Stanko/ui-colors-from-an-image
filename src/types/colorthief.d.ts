type RGB = [r: number, g: number, b: number];

declare module 'colorthief' {
  export default class ColorThief {
    getColor: (img: HTMLImageElement | null, quality: number = 10) => RGB;
    getPalette: (
      img: HTMLImageElement | null,
      colorCount: number = 10,
      quality: number = 10
    ) => RGB[] | null;
  }
}
