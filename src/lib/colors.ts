import { Hsluv } from 'hsluv';
import ColorThief from 'colorthief';
import { FastAverageColor } from 'fast-average-color';
import { Lib } from '../app/app';

export type RGB = [r: number, g: number, b: number];

export type ImageColors = {
  dominant: string;
  text: string;
  onWhite: string;
  onBlack: string;
  isDark: boolean;
};

export const DEFAULT_COLOR_SET: ImageColors = {
  dominant: 'white',
  text: 'black',
  onWhite: 'black',
  onBlack: 'white',
  isDark: false,
};

const AA_CONTRAST = 4.5;

// Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
// Returns a number between 0 and 1
export const getLuminance = (color: RGB): number => {
  const relativeBrightness = color.map((channel) => {
    const value = channel / 255;

    if (value < 0.03928) {
      return value / 12.92;
    } else {
      return Math.pow((value + 0.055) / 1.055, 2.4);
    }
  });

  return (
    0.2126 * relativeBrightness[0] +
    0.7152 * relativeBrightness[1] +
    0.0722 * relativeBrightness[2]
  );
};

// Formula: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
// Returns a number between 1 and 21
export const getContrast = (color1: RGB, color2: RGB): number => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  if (luminance1 > luminance2) {
    return (luminance1 + 0.05) / (luminance2 + 0.05);
  }

  return (luminance2 + 0.05) / (luminance1 + 0.05);
};

// Converts RGB color to HSLuv class instance
export function getHsluvFromRGB(color: RGB): Hsluv {
  const hsluvColor = new Hsluv();
  hsluvColor.rgb_r = color[0] / 255;
  hsluvColor.rgb_g = color[1] / 255;
  hsluvColor.rgb_b = color[2] / 255;
  hsluvColor.rgbToHsluv();

  return hsluvColor;
}

export function getRGBfromHSLuv(color: Hsluv): RGB {
  return [
    Math.round(color.rgb_r * 255),
    Math.round(color.rgb_g * 255),
    Math.round(color.rgb_b * 255),
  ];
}

export const modifyLightness = (colorRGB: RGB, tweak = 5): RGB => {
  const color = getHsluvFromRGB(colorRGB);

  // Subjectively selected threshold, to favorize darkening the colors
  const IS_LIGHT_THRESHOLD = 30;
  const SUPER_LIGHT = 90;
  const SUPER_SATURATION = 90;

  // Darken on lighten the color for the selected amount
  // 5% by default
  if (color.hsluv_l > IS_LIGHT_THRESHOLD) {
    color.hsluv_l -= tweak;

    // Edge case for super light and super saturated colors.
    // When we darken these colors, we get too much saturation,
    // and we need to artificially decrease it.
    // Color thief shouldn't return these colors, as it un-prioritize white.
    if (color.hsluv_l > SUPER_LIGHT && color.hsluv_s > SUPER_SATURATION) {
      // Reduce saturation by 25%
      color.hsluv_s *= 0.75;
    }
  } else {
    color.hsluv_l += tweak;
  }

  // Make sure RGB values are updated
  color.hsluvToRgb();

  // Get new RGB color from HSLuv
  return getRGBfromHSLuv(color);
};

//  * @returns
export const fixContrast = (
  color: RGB,
  blackOrWhite: 'black' | 'white',
  minContrast = AA_CONTRAST
): RGB => {
  const EPSILON = 0.1;
  const isWhite = blackOrWhite === 'white';
  // Convert background to RGB format
  const backgroundRGB: RGB = isWhite ? [255, 255, 255] : [0, 0, 0];

  // If contrast is already met, return the color copy
  let contrast = getContrast(color, backgroundRGB);
  if (contrast >= minContrast) {
    return [...color];
  }

  // Convert the color to HSLuv so we can adjust the lightness properly
  const colorHSL = getHsluvFromRGB(color);

  let updatedColor: RGB;
  let contrastDiff: number;

  // Range for binary search
  let left = 0;
  let right = 100;

  // Move one of the boundaries
  if (isWhite) {
    right = colorHSL.hsluv_l;
  } else {
    left = colorHSL.hsluv_l;
  }

  do {
    // Binary search
    // Update the lightness and test the contrast again
    colorHSL.hsluv_l = left + (right - left) / 2;

    // Make sure RGB values are updated
    colorHSL.hsluvToRgb();

    // Get new RGB color from HSLuv
    updatedColor = getRGBfromHSLuv(colorHSL);

    // And compare is against the background
    contrast = getContrast(updatedColor, backgroundRGB);

    // Update search boundaries
    contrastDiff = contrast - minContrast;

    if (isWhite === contrastDiff < 0) {
      right = colorHSL.hsluv_l;
    } else {
      left = colorHSL.hsluv_l;
    }

    // Repeat the process until the contrast is achieved,
    // and contrast diff is less than the give EPSILON
  } while (contrastDiff > EPSILON || contrastDiff < 0);

  return updatedColor;
};

function rgbToHex(color: RGB): string {
  return `#${color
    .map((c: number) => (c < 16 ? `0${c.toString(16)}` : c.toString(16)))
    .join('')}`;
}

async function loadImage(image: HTMLImageElement): Promise<void> {
  image.crossOrigin = 'Anonymous';

  if (image.complete) {
    return;
  }

  return new Promise((resolve, reject) => {
    image.addEventListener('load', function () {
      resolve();
    });
    image.addEventListener('error', function (error) {
      reject(error);
    });
  });
}

const cache: Record<string, RGB> = {};

export async function getColorsFromImage(
  image: HTMLImageElement,
  tweak = 0,
  lib: Lib = 'color-thief'
): Promise<ImageColors> {
  try {
    await loadImage(image);
  } catch (e) {
    console.log(e);
    // If image failed to load, return the default color set
    return DEFAULT_COLOR_SET;
  }

  const cacheKey = image.src + lib;

  try {
    let dominant = cache[cacheKey];

    if (!dominant) {
      if (lib === 'color-thief') {
        const colorThief = new ColorThief();
        dominant = await colorThief.getColor(image, 10);
      } else {
        const fac = new FastAverageColor();
        dominant = fac
          .getColor(image, {
            algorithm: lib === 'fast-average' ? 'simple' : 'dominant',
          })
          .value.slice(0, 3) as RGB;
      }

      // Cache dominant color
      cache[cacheKey] = dominant;
    }

    const onWhite: RGB = fixContrast(dominant, 'white');
    const onBlack: RGB = fixContrast(dominant, 'black');

    if (tweak) {
      dominant = modifyLightness(dominant, tweak);
    }

    // Color is considered dark if it fulfils contrast of 4.5 against white
    const isDark = getContrast(dominant, [255, 255, 255]) >= AA_CONTRAST;

    return {
      dominant: rgbToHex(dominant),
      text: isDark ? 'white' : 'black',
      onWhite: rgbToHex(onWhite),
      onBlack: rgbToHex(onBlack),
      isDark,
    };
  } catch (e) {
    console.log(e);
    // If color thief failed to get the color, return the default color set
    return DEFAULT_COLOR_SET;
  }
}
