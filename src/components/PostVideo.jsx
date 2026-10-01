import { useEffect, useRef, useState } from "react";
import PostImage from "./PostImage";
import { PlayIcon } from "./Icons";
import { FIGURE_SIZES, FIGURE_WIDTHS, imageBase, youtubeId } from "../lib/blog";

/**
 * A YouTube video in a post: `::video[Title](https://youtu.be/… "poster.jpg")`.
 *
 * CLICK TO LOAD. Until someone presses play, this is our own poster picture
 * and a play button, and nothing at all is requested from YouTube: no player
 * script, no thumbnail, no cookie. A YouTube iframe weighs about a megabyte of
 * script before anyone watches it, on every page view, and it tells Google who
 * read the post. The press swaps in the player, already playing.
 *
 * The player is youtube-nocookie.com, YouTube's privacy-enhanced host, which
 * is the ONE origin netlify.toml lets this site frame and the one the
 * Permissions-Policy there grants autoplay and fullscreen to. Change one and
 * the other has to change with it.
 *
 * Before the script runs it is a plain link to the video, so with scripting
 * off the button still does something: it opens the video on YouTube.
 */
const PostVideo = ({ href, title, poster, slug }) => {
  const id = youtubeId(href);
  const [playing, setPlaying] = useState(false);
  const frame = useRef(null);

  // The button the reader pressed is gone, so focus goes to the player that
  // replaced it rather than falling back to the top of the page.
  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  if (!id) return null;

  return (
    <figure className="postfigure postvideo" data-bleed="true">
      <div className="postvideo__box">
        {playing ? (
          <iframe
            ref={frame}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <a
            className="postvideo__play"
            href={`https://www.youtube.com/watch?v=${id}`}
            aria-label={`Play the video: ${title}`}
            onClick={(event) => {
              event.preventDefault();
              setPlaying(true);
            }}
          >
            {poster && (
              <PostImage
                base={imageBase(slug, poster)}
                widths={FIGURE_WIDTHS}
                sizes={FIGURE_SIZES}
                alt=""
              />
            )}
            <span className="postvideo__icon" aria-hidden="true">
              <PlayIcon width={30} height={30} />
            </span>
          </a>
        )}
      </div>
      <figcaption className="postfigure__caption">{title}</figcaption>
    </figure>
  );
};

export default PostVideo;
