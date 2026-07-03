import { useMemo, useState } from 'react';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const MAX_IMAGES = 6;
const MAX_VIDEOS = 2;
const MAX_VIDEO_DURATION_SECONDS = 20 * 60;

const getVideoDuration = (file) => new Promise((resolve, reject) => {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration || 0); };
  video.onerror = () => { URL.revokeObjectURL(video.src); reject(new Error('Không đọc được thời lượng video.')); };
  video.src = URL.createObjectURL(file);
});

const buildPreviewItems = (files = []) =>
  files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file)
  }));

const PostForm = ({ onSubmit }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const imageFiles = useMemo(() => images.map((item) => item.file), [images]);
  const videoFiles = useMemo(() => videos.map((item) => item.file), [videos]);

  const openComposer = () => {
    setError('');
    setIsOpen(true);
  };

  const closeComposer = () => {
    if (submitting) return;
    setError('');
    setIsOpen(false);
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} hình cho một bài viết.`);
      event.target.value = '';
      return;
    }

    setError('');
    setImages((prev) => [...prev, ...buildPreviewItems(files)]);
    event.target.value = '';
  };

  const handleVideosChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (videos.length + files.length > MAX_VIDEOS) {
      setError(`Bạn chỉ có thể chọn tối đa ${MAX_VIDEOS} video cho một bài viết.`);
      event.target.value = '';
      return;
    }

    try {
      for (const file of files) {
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_DURATION_SECONDS) {
          setError('Video chỉ được phép có thời lượng dưới 20 phút.');
          event.target.value = '';
          return;
        }
      }
      setError('');
      setVideos((prev) => [...prev, ...buildPreviewItems(files)]);
    } catch (err) {
      setError(err.message || 'Không kiểm tra được thời lượng video.');
    }
    event.target.value = '';
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleRemoveVideo = (id) => {
    setVideos((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const resetForm = () => {
    images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    videos.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setContent('');
    setIsAnonymous(false);
    setImages([]);
    setVideos([]);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const hasContent = content.trim().length > 0;
    const hasImages = imageFiles.length > 0;
    const hasVideos = videoFiles.length > 0;

    if (!hasContent && !hasImages && !hasVideos) {
      setError('Bài viết phải có nội dung hoặc ít nhất một ảnh/video.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        content: content.trim(),
        isAnonymous,
        images: imageFiles,
        videos: videoFiles
      });
      resetForm();
      setIsOpen(false);
    } catch (submitError) {
      setError(submitError.message || 'Không thể đăng bài.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="rounded-[26px] border border-slate-200 bg-white px-4 py-3 shadow-soft">
        <div className="flex items-center gap-3">
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            provider={currentUser?.provider}
            size="lg"
            className="h-12 w-12"
          />

          <button
            type="button"
            onClick={openComposer}
            className="min-w-0 flex-1 rounded-full bg-slate-100 px-5 py-3 text-left text-base text-slate-500 transition hover:bg-slate-200"
          >
            {currentUser?.name ? `${currentUser.name} ơi, bạn đang nghĩ gì thế?` : 'Bạn đang nghĩ gì thế?'}
          </button>

          <label className="hidden cursor-pointer rounded-2xl p-2.5 text-rose-500 transition hover:bg-rose-50 sm:inline-flex">
            <span className="text-2xl">📹</span>
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(event) => {
                openComposer();
                handleVideosChange(event);
              }}
            />
          </label>

          <label className="hidden cursor-pointer rounded-2xl p-2.5 text-emerald-500 transition hover:bg-emerald-50 sm:inline-flex">
            <span className="text-2xl">🖼️</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                openComposer();
                handleImagesChange(event);
              }}
            />
          </label>
        </div>
      </section>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={closeComposer}
        >
          <form
            onSubmit={handleSubmit}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="w-10" />
              <h2 className="text-2xl font-bold text-slate-900">Tạo bài viết</h2>
              <button
                type="button"
                onClick={closeComposer}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-3xl leading-none text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="flex items-center gap-3">
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name}
                  provider={currentUser?.provider}
                  size="lg"
                  className="h-14 w-14"
                />
                <div>
                  <p className="text-xl font-semibold text-slate-900">{currentUser?.name || 'Người dùng'}</p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(event) => setIsAnonymous(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    {isAnonymous ? 'Ẩn danh' : 'Công khai'}
                  </label>
                </div>
              </div>

              <Textarea
                placeholder={`${currentUser?.name || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="min-h-[180px] border-0 px-0 py-0 text-[18px] shadow-none focus:ring-0"
                error={error}
              />

              {(images.length || videos.length) ? (
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  {images.length ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {images.map((image) => (
                        <div key={image.id} className="relative overflow-hidden rounded-2xl bg-white">
                          <img src={image.previewUrl} alt="preview" className="h-32 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-rose-500 shadow"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {videos.length ? (
                    <div className="space-y-3">
                      {videos.map((video) => (
                        <div key={video.id} className="relative overflow-hidden rounded-2xl bg-white p-2">
                          <video src={video.previewUrl} controls className="h-56 w-full rounded-xl bg-slate-900 object-cover" preload="metadata" />
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(video.id)}
                            className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-rose-500 shadow"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-800">Thêm vào bài viết của bạn</p>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded-2xl p-2.5 text-emerald-500 transition hover:bg-emerald-50">
                      <span className="text-2xl">🖼️</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                    </label>
                    <label className="cursor-pointer rounded-2xl p-2.5 text-rose-500 transition hover:bg-rose-50">
                      <span className="text-2xl">📹</span>
                      <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideosChange} />
                    </label>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  Tối đa {MAX_IMAGES} ảnh và {MAX_VIDEOS} video.
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl py-3 text-base disabled:opacity-50"
              >
                {submitting ? 'Đang đăng...' : 'Đăng bài'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
};

export default PostForm;
