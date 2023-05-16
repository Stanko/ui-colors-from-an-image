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
};

const Cover: React.FC<CoverProps> = ({
  cover,
  artist,
  album,
  lib,
  tweak = 0,
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
