import {withAmpContext} from '#preact/context';

export function Youtube({videoid, playlistid, params, width, height}) {
  const src = playlistid
    ? `https://www.youtube.com/embed/videoseries?list=${playlistid}&${params}`
    : `https://www.youtube.com/embed/${videoid}?${params}`;

  return (
    <iframe
      width={width}
      height={height}
      src={src}
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  );
}

export const YoutubeWithContext = withAmpContext(Youtube);
