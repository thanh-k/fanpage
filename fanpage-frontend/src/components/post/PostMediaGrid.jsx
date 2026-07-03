import { useState } from 'react';
import { resolveMediaUrl } from '../../utils/media';

const isVideo = (media) => {
  const type = String(media?.type || media?.mediaType || '').toLowerCase();
  const url = String(media?.url || media?.mediaUrl || media?.fileUrl || media || '').toLowerCase();
  return type.includes('video') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
};

const getUrl = (media) => resolveMediaUrl(media?.url || media?.mediaUrl || media?.fileUrl || media);

const getTileClass = (count, index) => {
  if (count === 1) return 'col-span-2 h-[240px] sm:h-[320px] md:h-[360px]';
  if (count === 2) return 'h-[190px] sm:h-[260px] md:h-[300px]';
  if (count === 3) return index === 0 ? 'row-span-2 h-[260px] sm:h-[320px] md:h-[360px]' : 'h-[129px] sm:h-[159px] md:h-[179px]';
  return 'h-[160px] sm:h-[200px] md:h-[220px]';
};

const PostMediaGrid = ({ media = [], detail = false }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const items = Array.isArray(media) ? media.filter(Boolean) : [];
  const active = activeIndex !== null ? items[activeIndex] : null;

  if (!items.length) return null;

  if (detail) {
    return (
      <div className="mt-4 space-y-4">
        {items.map((item, index) => {
          const url = getUrl(item);
          return isVideo(item) ? (
            <video
              key={`${url}-${index}`}
              src={url}
              controls
              className="w-full rounded-2xl bg-black"
              preload="metadata"
            />
          ) : (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="block w-full overflow-hidden rounded-2xl bg-slate-100"
            >
              <img src={url} alt="Ảnh bài viết" className="w-full object-cover" loading="lazy" />
            </button>
          );
        })}

        {active && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-2 sm:p-4"
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-lg font-black text-slate-900 sm:right-5 sm:top-5 sm:px-4 sm:py-2 sm:text-xl"
            >
              ×
            </button>

            {isVideo(active) ? (
              <video
                src={getUrl(active)}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[95vw] rounded-2xl bg-black"
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <img
                src={getUrl(active)}
                alt="Ảnh bài viết"
                className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  const visibleItems = items.slice(0, 4);
  const gridCols = items.length === 1 ? 'grid-cols-2' : 'grid-cols-2';

  return (
    <>
      <div className={`mt-1 grid ${gridCols} gap-[2px] overflow-hidden bg-slate-200`}>
        {visibleItems.map((item, index) => {
          const url = getUrl(item);
          const showMore = index === 3 && items.length > 4;

          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative overflow-hidden bg-slate-100 ${getTileClass(items.length, index)}`}
            >
              {isVideo(item) ? (
                <video src={url} className="h-full w-full object-cover" preload="metadata" />
              ) : (
                <img src={url} alt="Ảnh bài viết" className="h-full w-full object-cover" loading="lazy" />
              )}

              {isVideo(item) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/65 pl-1 text-2xl text-white shadow-lg">
                    ▶
                  </span>
                </div>
              )}

              {showMore && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-3xl font-black text-white">
                  +{items.length - 4}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-2 sm:p-4"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-lg font-black text-slate-900 sm:right-5 sm:top-5 sm:px-4 sm:py-2 sm:text-xl"
          >
            ×
          </button>

          {isVideo(active) ? (
            <video
              src={getUrl(active)}
              controls
              autoPlay
              className="max-h-[90vh] max-w-[95vw] rounded-2xl bg-black"
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <img
              src={getUrl(active)}
              alt="Ảnh bài viết"
              className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PostMediaGrid;
