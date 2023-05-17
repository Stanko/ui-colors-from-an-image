import React, { useEffect, useRef, useState } from 'react';
import {
  ImageColors,
  getColorsFromImage,
  DEFAULT_COLOR_SET,
} from '../lib/colors';

import './cover.css';
import { Lib } from '../app/app';

export type CoverProps = {
  cover: string;
  artist: string;
  album: string;
  lib?: Lib;
  tweak?: number;
  remove?: () => void;
};

const Cover: React.FC<CoverProps> = ({
  cover,
  artist,
  album,
  lib,
  tweak = 0,
  remove,
}) => {
  const image = useRef<HTMLImageElement>(null);
  const [colors, setColors] = useState<ImageColors>(DEFAULT_COLOR_SET);

  useEffect(() => {
    if (image.current) {
      getColorsFromImage(image.current, tweak, lib).then((colors) => {
        setColors(colors);
      });
    }
  }, [cover, tweak, lib]);

  return (
    <div className="cover" style={{ background: colors.dominant }}>
      {remove && (
        <button
          className="cover-remove"
          onClick={remove}
          style={{ color: colors.text }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <title>Remove</title>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              d="M 1 1 L 15 15 M 15 1 L 1 15"
            />
          </svg>
        </button>
      )}
      <div className="cover-wrapper">
        <img src={cover} alt="" aria-hidden="true" ref={image} />
      </div>
      <div className="cover-text" style={{ color: colors.text }}>
        <b>{album}</b>
        <div>{artist}</div>
      </div>
      <div className="cover-text cover-text--white" aria-hidden="true">
        <b style={{ color: colors.onWhite }}>{album}</b>
        <div>{artist}</div>
      </div>
      <div className="cover-text cover-text--black" aria-hidden="true">
        <b style={{ color: colors.onBlack }}>{album}</b>
        <div>{artist}</div>
      </div>
    </div>
  );
};
export default Cover;
