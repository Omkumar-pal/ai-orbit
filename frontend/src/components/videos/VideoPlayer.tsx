"use client";

import { useState } from "react";

export default function VideoPlayer({
  youtubeId,
  title,
  thumbnail,
}: {
  youtubeId: string;
  title: string;
  thumbnail: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const poster = thumbnail || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-black">
      {poster && !playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="absolute inset-0 z-0 block h-full w-full cursor-pointer overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt={title} className="h-full w-full object-cover opacity-80" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-xl backdrop-blur-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
          </span>
        </button>
      )}
      {(!poster || playing) && (
        <iframe
          className="relative z-10 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
