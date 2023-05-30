import { useState } from 'react';
import Cover, { CoverProps } from '../cover/cover.tsx';
import './app.css';

const covers: CoverProps[] = [
  {
    album: '13 Songs',
    artist: 'Fugazi',
    cover: './covers/fugazi.jpg',
  },
  {
    album: 'White Album',
    artist: 'The Beatles',
    cover: './covers/white-album.jpg',
  },
  {
    album: 'Your Sincerely, Dr Hardcore',
    artist: 'Gallops',
    cover: './covers/dr-hardcore.jpg',
  },
  {
    album: 'Muttermaschine',
    artist: 'Mother Engine',
    cover: './covers/motherengine.jpg',
  },
  {
    album: 'Use Your Illusion I',
    artist: "Guns n' Roses",
    cover: './covers/illusion.jpg',
  },
  {
    album: 'Use Your Illusion II',
    artist: "Guns n' Roses",
    cover: './covers/illusion-ii.jpg',
  },
  {
    album: 'Graveyard',
    artist: 'Graveyard',
    cover: './covers/graveyard.jpg',
  },
  {
    album: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    cover: './covers/dark-side.jpg',
  },
  {
    album: 'Ten',
    artist: 'Pearl Jam',
    cover: './covers/ten.jpg',
  },
  {
    album: 'Help!',
    artist: 'The Beatles',
    cover: './covers/help.jpg',
  },
  {
    album: "Sgt. Pepper's Lonely Hearts Club Band",
    artist: 'The Beatles',
    cover: './covers/sgt-pepper.jpg',
  },
  {
    album: 'Polygondwanaland',
    artist: 'King Gizzard & The Lizard Wizard',
    cover: './covers/polygondwanaland.jpg',
  },
];

export type Lib = 'color-thief' | 'fast-average' | 'fast-dominant';

const libraries: { label: string; value: Lib; link: string }[] = [
  {
    label: 'Color Thief (dominant)',
    value: 'color-thief',
    link: 'https://github.com/lokesh/color-thief',
  },
  {
    label: 'fast-average-color (dominant)',
    value: 'fast-dominant',
    link: 'https://github.com/fast-average-color/fast-average-color',
  },
  {
    label: 'fast-average-color (average)',
    value: 'fast-average',
    link: 'https://github.com/fast-average-color/fast-average-color',
  },
];

function App() {
  const [tweak, setTweak] = useState(5);
  const [userImages, setUserImages] = useState<string[]>([]);
  const [lib, setLib] = useState<Lib>('color-thief');

  return (
    <main>
      <div className="controls">
        <div className="control">
          <div className="control-label">Library:</div>
          {libraries.map((library) => {
            return (
              <label key={library.value}>
                <input
                  type="radio"
                  name="lib"
                  value={library.value}
                  checked={lib === library.value}
                  onChange={(e) => setLib(e.target.value as Lib)}
                />
                {library.label}{' '}
                <a href={library.link}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 122.6 122.88"
                  >
                    <title>Open homepage</title>
                    <path
                      fill="currentColor"
                      d="M110.6 72.58c0-3.19 2.59-5.78 5.78-5.78 3.19 0 5.78 2.59 5.78 5.78v33.19c0 4.71-1.92 8.99-5.02 12.09a17.06 17.06 0 0 1-12.09 5.02H17.11c-4.71 0-8.99-1.92-12.09-5.02A17.06 17.06 0 0 1 0 105.77V17.19C0 12.48 1.92 8.2 5.02 5.1 8.12 2 12.4.08 17.11.08h32.98c3.19 0 5.78 2.59 5.78 5.78 0 3.19-2.59 5.78-5.78 5.78H17.11c-1.52 0-2.9.63-3.91 1.63a5.511 5.511 0 0 0-1.63 3.91v88.58c0 1.52.63 2.9 1.63 3.91a5.511 5.511 0 0 0 3.91 1.63h87.95c1.52 0 2.9-.63 3.91-1.63s1.63-2.39 1.63-3.91V72.58zm1.82-55.12L54.01 76.6a5.776 5.776 0 0 1-8.16.07 5.776 5.776 0 0 1-.07-8.16l56.16-56.87H78.56c-3.19 0-5.78-2.59-5.78-5.78 0-3.19 2.59-5.78 5.78-5.78h26.5c5.12 0 11.72-.87 15.65 3.1 2.48 2.51 1.93 22.52 1.61 34.11-.08 3-.15 5.29-.15 6.93 0 3.19-2.59 5.78-5.78 5.78-3.19 0-5.78-2.59-5.78-5.78 0-.31.08-3.32.19-7.24.16-6.04 1.13-14.04 1.62-19.52z"
                    />
                  </svg>
                </a>
              </label>
            );
          })}
        </div>
        <div>
          <div className="control">
            <label htmlFor="tweak" className="control-label">
              Tweak lightness ({tweak}%)
            </label>
            <div className="control-note">
              To prevent covers from blending into the background color
            </div>
            <input
              type="range"
              id="tweak"
              value={tweak}
              onInput={(e) => {
                setTweak(parseInt((e.target as HTMLInputElement).value, 10));
              }}
              min={0}
              max={10}
              step={1}
            />
          </div>
          <div className="control">
            <label className="control-label">
              Test local file:
              <input
                type="file"
                onChange={(e) => {
                  const input = e.target as HTMLInputElement;

                  if (input.files && input.files.length > 0) {
                    setUserImages([
                      URL.createObjectURL(input.files[0]),
                      ...userImages,
                    ]);
                    input.value = '';
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="covers">
        {userImages.map((image, i) => {
          return (
            <Cover
              key={image}
              cover={image}
              artist={'Unknown'}
              album={'Hello World'}
              tweak={tweak}
              lib={lib}
              remove={() => {
                const newUserImages = [...userImages];
                newUserImages.splice(i, 1);
                setUserImages(newUserImages);
              }}
            />
          );
        })}
        {covers.map((cover) => {
          return (
            <Cover
              key={cover.cover}
              cover={cover.cover}
              artist={cover.artist}
              album={cover.album}
              tweak={tweak}
              lib={lib}
            />
          );
        })}
      </div>
    </main>
  );
}

export default App;
