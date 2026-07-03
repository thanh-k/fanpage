import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatDate';
import { resolveMediaUrl } from '../../utils/media';
import CommentForm from '../comment/CommentForm';
import CommentList from '../comment/CommentList';
import Button from '../common/Button';
import PostMediaGrid from './PostMediaGrid';
import Avatar from '../common/Avatar';
import reportService from '../../services/reportService';
import postService from '../../services/postService';
import { rememberFeedScroll } from '../../utils/feedNavigationCache';

// Định nghĩa danh mục hành vi tố cáo cụ thể đồng bộ với Enum của Backend
const REACTIONS = [
  { type: 'LIKE', label: 'Thích', icon: '👍', color: 'text-sky-600', bg: 'bg-sky-50' },
  { type: 'LOVE', label: 'Yêu thích', icon: '❤️', color: 'text-rose-600', bg: 'bg-rose-50' },
  { type: 'HAHA', label: 'Haha', icon: '😂', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { type: 'WOW', label: 'Wow', icon: '😮', color: 'text-amber-600', bg: 'bg-amber-50' },
  { type: 'SAD', label: 'Buồn', icon: '😢', color: 'text-blue-500', bg: 'bg-blue-50' },
  { type: 'ANGRY', label: 'Phẫn nộ', icon: '😡', color: 'text-orange-600', bg: 'bg-orange-50' }
];

const getReaction = (type) => REACTIONS.find((item) => item.type === type) || REACTIONS[0];

// Định nghĩa danh mục hành vi tố cáo cụ thể đồng bộ với Enum của Backend
const VIOLATION_CATEGORIES = [
  { value: 'SPAM', label: 'Spam / Quảng cáo rác / Link độc hại' },
  { value: 'HATE_SPEECH', label: 'Ngôn từ gây thù ghét / Xúc phạm tôn giáo, chủng tộc, quốc gia' },
  { value: 'HARASSMENT', label: 'Quấy rối / Đe dọa / Bắt nạt, bôi nhọ cá nhân' },
  { value: 'NUDITY_PORNOGRAPHY', label: 'Hình ảnh khỏa thân / Nội dung khiêu dâm, đồi trụy' },
  { value: 'VIOLENCE_CRUELTY', label: 'Bạo lực / Ghê rợn / Kích động hành vi nguy hiểm, máu me' },
  { value: 'FRAUD_SCAM', label: 'Lừa đảo tiền bạc / Kinh doanh bất hợp pháp / Giả mạo danh tính' },
  { value: 'FALSE_INFORMATION', label: 'Tin giả / Thông tin sai sự thật gây hoang mang dư luận' },
  { value: 'OTHER', label: 'Lý do vi phạm tiêu chuẩn cộng đồng khác...' }
];

const PostCard = ({
  post,
  currentUserId,
  onAddComment,
  onDeletePost,
  onUpdatePost,
  onToggleLike,
  showActions = true,
  defaultOpenComments = false,
  detailMedia = false
}) => {
  const location = useLocation();
  const [showDiscussion, setShowDiscussion] = useState(defaultOpenComments);
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editAnonymous, setEditAnonymous] = useState(Boolean(post.isAnonymous));
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);
  const [editExistingMedia, setEditExistingMedia] = useState([]);
  const [editImageInputKey, setEditImageInputKey] = useState(0);
  const [editVideoInputKey, setEditVideoInputKey] = useState(0);
  const [reactionUsers, setReactionUsers] = useState([]);
  const [reactionFilter, setReactionFilter] = useState('ALL');
  const [reactionModalOpen, setReactionModalOpen] = useState(false);

  // States quản lý Modal Tố cáo nâng cao mới
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: '', id: null });
  const [selectedViolation, setSelectedViolation] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [touchReactionType, setTouchReactionType] = useState(null);
  const reactionCloseTimerRef = useRef(null);
  const reactionTouchTimerRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const reactionLongPressedRef = useRef(false);

  useEffect(() => {
    if (!editing) {
      setEditContent(post.content || '');
      setEditAnonymous(Boolean(post.isAnonymous));
      setEditError('');
    }
  }, [post.content, post.isAnonymous, editing]);

  useEffect(() => {
    return () => {
      [...editImages, ...editVideos].forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
      if (reactionCloseTimerRef.current) {
        clearTimeout(reactionCloseTimerRef.current);
      }
      if (reactionTouchTimerRef.current) {
        clearTimeout(reactionTouchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showReactionPicker) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const blockScroll = (event) => {
      event.preventDefault();
    };

    document.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.removeEventListener('touchmove', blockScroll);
    };
  }, [showReactionPicker]);

  const openReactionPicker = () => {
    if (reactionCloseTimerRef.current) {
      clearTimeout(reactionCloseTimerRef.current);
    }
    setShowReactionPicker(true);
  };

  const closeReactionPicker = () => {
    if (reactionCloseTimerRef.current) {
      clearTimeout(reactionCloseTimerRef.current);
    }
    reactionCloseTimerRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 500);
  };

  const handleChooseReaction = async (reactionType) => {
    setShowReactionPicker(false);
    setTouchReactionType(null);
    await onToggleLike(post.id, reactionType);
  };

  const getReactionTypeFromTouch = (touch) => {
    if (!touch) return null;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    return element?.closest?.('[data-reaction-type]')?.getAttribute('data-reaction-type') || null;
  };

  const handleReactionTouchStart = (event) => {
    if (reactionTouchTimerRef.current) {
      clearTimeout(reactionTouchTimerRef.current);
    }
    reactionLongPressedRef.current = false;
    setTouchReactionType(null);
    reactionTouchTimerRef.current = setTimeout(() => {
      reactionLongPressedRef.current = true;
      openReactionPicker();
      if (navigator.vibrate) {
        navigator.vibrate(12);
      }
    }, 320);
  };

  const handleReactionTouchMove = (event) => {
    if (!showReactionPicker) return;
    event.preventDefault();
    const reactionType = getReactionTypeFromTouch(event.touches?.[0]);
    setTouchReactionType(reactionType);
  };

  const handleReactionTouchEnd = async (event) => {
    if (reactionTouchTimerRef.current) {
      clearTimeout(reactionTouchTimerRef.current);
    }

    if (!reactionLongPressedRef.current) {
      return;
    }

    event.preventDefault();
    const reactionType = touchReactionType || getReactionTypeFromTouch(event.changedTouches?.[0]);
    reactionLongPressedRef.current = false;
    setShowReactionPicker(false);
    setTouchReactionType(null);

    if (reactionType) {
      await onToggleLike(post.id, reactionType);
    }
  };

  const openReactionUsers = async () => {
    try {
      const data = await postService.getReactionUsers(post.id);
      setReactionUsers(data);
      setReactionFilter('ALL');
      setReactionModalOpen(true);
    } catch (err) {
      alert(err.message || 'Không thể tải danh sách cảm xúc.');
    }
  };

  const validateEditVideos = async (files) => {
    for (const file of files) {
      const duration = await new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration || 0); };
        video.onerror = () => { URL.revokeObjectURL(video.src); reject(new Error('Không đọc được thời lượng video.')); };
        video.src = URL.createObjectURL(file);
      });
      if (duration > 20 * 60) throw new Error('Video chỉ được phép có thời lượng dưới 20 phút.');
    }
  };


  const isMediaVideo = (media) => {
    const type = String(media?.type || media?.mediaType || '').toLowerCase();
    const url = String(media?.url || media?.mediaUrl || media?.fileUrl || media || '').toLowerCase();
    return type.includes('video') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  };

  const getMediaUrl = (media) => resolveMediaUrl(media?.url || media?.mediaUrl || media?.fileUrl || media || '');

  const buildExistingEditMedia = (items = []) => items.filter(Boolean).map((item, index) => ({
    id: item.id ?? `${item.url || item.mediaUrl || item.fileUrl || index}`,
    key: `${item.id ?? index}-${item.url || item.mediaUrl || item.fileUrl || ''}`,
    url: getMediaUrl(item),
    type: isMediaVideo(item) ? 'video' : 'image',
    removed: false,
    original: item
  }));

  const revokeSelectedFiles = (files = []) => {
    files.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
  };

  const createPreviewFiles = (files = []) => files.map((file) => {
    file.previewUrl = URL.createObjectURL(file);
    return file;
  });

  const removeNewImage = (index) => {
    setEditImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const removeNewVideo = (index) => {
    setEditVideos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const toggleRemoveExistingMedia = (key) => {
    setEditExistingMedia((prev) => prev.map((item) => item.key === key ? { ...item, removed: !item.removed } : item));
  };

  const urlToFile = async (url, fallbackName, typeHint) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể lấy lại ảnh/video hiện tại để cập nhật.');
    const blob = await response.blob();
    const extension = blob.type?.split('/')[1]?.split(';')[0] || (typeHint === 'video' ? 'mp4' : 'jpg');
    return new File([blob], `${fallbackName}.${extension}`, { type: blob.type || (typeHint === 'video' ? 'video/mp4' : 'image/jpeg') });
  };

  const canDelete = currentUserId && currentUserId === post.userId && typeof onDeletePost === 'function';
  const canEdit = currentUserId && currentUserId === post.userId && typeof onUpdatePost === 'function';
  const canLike = typeof onToggleLike === 'function';
  const medias = Array.isArray(post.mediaItems) ? post.mediaItems : [];
  const commentCount = post.commentCount || post.comments?.length || 0;
  const likeCount = post.likesCount || 0;
  const currentReaction = post.currentReactionType ? getReaction(post.currentReactionType) : null;
  const reactionCounts = post.reactionCounts || {};
  const topReactions = REACTIONS.filter((reaction) => Number(reactionCounts[reaction.type] || 0) > 0).slice(0, 3);

  // Tính toán tên hiển thị dự phòng an toàn tuyệt đối
  const authorName = post.authorDisplayName || post.displayAuthorName || "Người dùng ẩn danh";


  // FIX LỖI 500: Ép kiểu targetId an toàn tuyệt đối ngay khi mở hộp thoại
  const openReportDialog = (targetType, idInput) => {
    let cleanId = null;
    
    if (idInput && typeof idInput === 'object') {
      // Trường hợp nếu vô tình nhận nhầm cả Object (ví dụ Object comment hoặc post)
      cleanId = idInput.id || idInput._id;
    } else {
      cleanId = idInput;
    }

    const finalId = Number(cleanId);
    if (!finalId || isNaN(finalId)) {
      alert("Lỗi hệ thống: Không thể trích xuất ID nội dung để tạo đơn tố cáo.");
      return;
    }

    setReportTarget({ type: targetType, id: finalId });
    setSelectedViolation('SPAM');
    setReportDetails('');
    setIsReportModalOpen(true);
  };

  // Hàm xử lý gửi Tố cáo lên Backend
  const handleConfirmReport = async () => {
    if (!reportTarget.id || isNaN(reportTarget.id)) {
      alert('ID nội dung tố cáo không đúng định dạng số nguyên (Long).');
      return;
    }

    try {
      setReporting(true);
      
      // Tiến hành gửi lên API của Backend
      await reportService.createReport({
        targetType: reportTarget.type, // "POST" hoặc "COMMENT"
        targetId: reportTarget.id,     // Đã được ép kiểu Number sạch sẽ
        violationType: selectedViolation,
        details: reportDetails.trim()
      });
      
      alert('Gửi tố cáo thành công. Ban quản trị sẽ tiến hành kiểm duyệt nội dung này trong thời gian sớm nhất.');
      setIsReportModalOpen(false);
    } catch (err) {
      alert(err.message || 'Không thể gửi đơn tố cáo nội dung.');
    } finally {
      setReporting(false);
    }
  };

  const openEdit = () => {
    setEditContent(post.content || '');
    setEditAnonymous(Boolean(post.isAnonymous));
    setEditError('');
    revokeSelectedFiles(editImages);
    revokeSelectedFiles(editVideos);
    setEditImages([]);
    setEditVideos([]);
    setEditExistingMedia(buildExistingEditMedia(medias));
    setEditImageInputKey((prev) => prev + 1);
    setEditVideoInputKey((prev) => prev + 1);
    setEditing(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;
    revokeSelectedFiles(editImages);
    revokeSelectedFiles(editVideos);
    setEditing(false);
    setEditError('');
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    const hasContent = editContent.trim().length > 0;
    const keptExistingMedia = editExistingMedia.filter((item) => !item.removed);
    const hasMedia = keptExistingMedia.length > 0 || editImages.length > 0 || editVideos.length > 0;
    const removedExistingMedia = editExistingMedia.some((item) => item.removed);

    if (!hasContent && !hasMedia) {
      setEditError('Bài viết phải có nội dung hoặc ít nhất một ảnh/video.');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');

      let imagesToSave = [...editImages];
      let videosToSave = [...editVideos];
      let keepExistingMedia = !removedExistingMedia;

      if (removedExistingMedia) {
        keepExistingMedia = false;
        const keptFiles = await Promise.all(keptExistingMedia.map((item, index) => urlToFile(item.url, `media-${post.id}-${index}`, item.type)));
        imagesToSave = [
          ...keptFiles.filter((file, index) => keptExistingMedia[index]?.type !== 'video'),
          ...editImages
        ];
        videosToSave = [
          ...keptFiles.filter((file, index) => keptExistingMedia[index]?.type === 'video'),
          ...editVideos
        ];
      }

      await onUpdatePost(post.id, {
        content: editContent.trim(),
        isAnonymous: editAnonymous,
        images: imagesToSave,
        videos: videosToSave,
        keepExistingMedia
      });
      revokeSelectedFiles(editImages);
      revokeSelectedFiles(editVideos);
      setEditing(false);
    } catch (error) {
      setEditError(error.message || 'Không thể cập nhật bài viết.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <article id={`post-card-${post.id}`} className="scroll-mt-6 overflow-visible rounded-[20px] border border-slate-200 bg-white shadow-soft sm:rounded-[24px]">
        <div className="p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar
                src={post.author?.avatar}
                name={authorName}
                provider={post.author?.provider}
                size="lg"
              />
              <div className="min-w-0">
                {(!post.author || !post.author.id || post.isAnonymous) ? (
                  <p className="font-semibold text-slate-900">{authorName}</p>
                ) : (
                  <Link to={`/user/${post.author.id}`} className="font-semibold text-slate-900 hover:text-sky-600">
                    {authorName}
                  </Link>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatDateTime(post.createdAt)}</span>
                  {post.updatedAt && post.updatedAt !== post.createdAt ? (
                    <><span>•</span><span>Đã chỉnh sửa</span></>
                  ) : null}
                  <span>•</span><span>{post.isAnonymous ? 'Ẩn danh' : 'Công khai'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {!canDelete ? (
                <Button disabled={reporting} variant="ghost" className="rounded-full px-2.5 py-2 text-rose-600 sm:px-3" onClick={() => openReportDialog('POST', post.id)}>
                  <span className="sm:hidden">🚩</span><span className="hidden sm:inline">Tố cáo</span>
                </Button>
              ) : null}
              {canEdit ? (
                <Button variant="ghost" className="rounded-full px-2.5 py-2 text-sky-600 sm:px-3" onClick={openEdit}><span className="sm:hidden">✏️</span><span className="hidden sm:inline">Sửa</span></Button>
              ) : null}
              {canDelete ? (
                <Button variant="ghost" className="rounded-full px-2.5 py-2 text-rose-600 sm:px-3" onClick={() => onDeletePost(post.id)}><span className="sm:hidden">🗑️</span><span className="hidden sm:inline">Xóa</span></Button>
              ) : null}
            </div>
          </div>

          {post.content ? <div className="mt-3"><p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-800">{post.content}</p></div> : null}
        </div>

        <PostMediaGrid media={medias} detail={detailMedia} />

        <div className="px-3.5 pb-4 pt-3 sm:px-5">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              {topReactions.length ? (
                <div className="flex -space-x-1">
                  {topReactions.map((reaction) => (
                    <span
                      key={reaction.type}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white text-sm shadow-sm"
                      title={reaction.label}
                    >
                      {reaction.icon}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs text-white">
                  👍
                </span>
              )}
              <button type="button" onClick={openReactionUsers} className="hover:text-sky-600">{likeCount}</button>
            </div>
            <button type="button" onClick={() => setShowDiscussion((prev) => !prev)} className="hover:text-sky-600">{commentCount} bình luận</button>
          </div>

          {showActions ? (
            <div className="mt-3 grid grid-cols-3 gap-1.5 border-y border-slate-100 py-2 sm:gap-2">
              {canLike ? (
                <div
                  className="relative flex min-w-0 touch-none justify-center"
                  onMouseEnter={openReactionPicker}
                  onMouseLeave={closeReactionPicker}
                  onFocus={openReactionPicker}
                  onTouchMove={handleReactionTouchMove}
                  onTouchEnd={handleReactionTouchEnd}
                  onTouchCancel={() => { setShowReactionPicker(false); setTouchReactionType(null); }}
                >
                  <div className="absolute bottom-full left-0 right-0 h-2" />
                  {showReactionPicker ? (
                    <div
                      ref={reactionPickerRef}
                      className="absolute bottom-full left-0 z-30 mb-2 flex max-w-[calc(100vw-24px)] items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-2 py-1.5 shadow-xl ring-1 ring-sky-100 backdrop-blur sm:left-1/2 sm:mb-3 sm:-translate-x-1/2 sm:gap-1.5 sm:px-2.5 sm:py-2"
                    >
                      {REACTIONS.map((reaction) => (
                        <button
                          key={reaction.type}
                          type="button"
                          title={reaction.label}
                          data-reaction-type={reaction.type}
                          onClick={() => handleChooseReaction(reaction.type)}
                          className={`group/reaction flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[21px] leading-none transition-all duration-150 hover:bg-slate-50 sm:h-9 sm:w-9 sm:text-[23px] ${
                            touchReactionType === reaction.type
                              ? '-translate-y-1.5 scale-110 bg-slate-50 shadow-md'
                              : 'hover:-translate-y-1.5 hover:scale-110 hover:shadow-md'
                          }`}
                        >
                          <span className="pointer-events-none drop-shadow-sm transition-transform duration-150 group-hover/reaction:scale-110">{reaction.icon}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onTouchStart={handleReactionTouchStart}
                    onClick={(event) => {
                      if (reactionLongPressedRef.current) {
                        event.preventDefault();
                        reactionLongPressedRef.current = false;
                        return;
                      }
                      onToggleLike(post.id, post.currentReactionType ? null : 'LIKE');
                    }}
                    className={`inline-flex min-h-[42px] w-full min-w-0 touch-none select-none items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold transition sm:min-h-[44px] sm:gap-2 sm:px-3 ${
                      currentReaction
                        ? `${currentReaction.bg} ${currentReaction.color}`
                        : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
                    }`}
                  >
                    <span className="text-lg">{currentReaction?.icon || '👍'}</span>
                    <span className="hidden sm:inline">{currentReaction?.label || 'Thích'}</span>
                    <span className="sm:hidden">{currentReaction ? '' : 'Thích'}</span>
                  </button>
                </div>
              ) : null}
              <button type="button" onClick={() => setShowDiscussion((prev) => !prev)} className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-sky-600 sm:min-h-[44px] sm:gap-2 sm:px-3"><span>💬</span><span className="hidden sm:inline">Bình luận</span></button>
              <Link to={`/posts/${post.id}`} state={{ fromHome: location.pathname === '/', targetPostId: post.id }} onClick={() => rememberFeedScroll(post.id)} className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-sky-600 sm:min-h-[44px] sm:gap-2 sm:px-3"><span>🔍</span><span className="hidden sm:inline">Chi tiết</span></Link>
            </div>
          ) : null}

          {showDiscussion ? (
            <div className="mt-4 space-y-3 rounded-[22px] bg-slate-50 p-3 ring-1 ring-slate-100 sm:p-4">
              {commentCount ? (
                <CommentList 
                  comments={post.comments} 
                  onReportComment={(commentId) => openReportDialog('COMMENT', commentId)}
                  onReply={(parentId, content) => onAddComment({ postId: post.id, content, parentId })}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">💬</span><span>Chưa có bình luận nào. Hãy là người đầu tiên bình luận.</span></div>
              )}
              <CommentForm onSubmit={(content) => onAddComment({ postId: post.id, content })} />
            </div>
          ) : null}
        </div>
      </article>

      {/* MODAL CHỈNH SỬA NỘI DUNG BÀI VIẾT */}
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={closeEdit}>
          <form onSubmit={submitEdit} className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-[28px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-black text-slate-900">Chỉnh sửa bài viết</h2>
              <button type="button" onClick={closeEdit} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500 hover:bg-slate-200">×</button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                <input
                  type="checkbox"
                  checked={editAnonymous}
                  onChange={(event) => setEditAnonymous(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                {editAnonymous ? 'Đăng ẩn danh' : 'Đăng công khai'}
              </label>

              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                rows={8}
                maxLength={5000}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="Nội dung bài viết..."
              />

              <div className="space-y-4 rounded-2xl border border-slate-200 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-slate-800">Ảnh/Video bài viết</p>
                    <p className="text-xs text-slate-500">Bấm dấu × trên từng ảnh/video để xóa riêng. Video mới phải dưới 20 phút.</p>
                  </div>
                  <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Giữ {editExistingMedia.filter((item) => !item.removed).length} hiện tại • Thêm {editImages.length + editVideos.length} mới
                  </p>
                </div>

                {editExistingMedia.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {editExistingMedia.map((item, index) => (
                      <div key={item.key} className={`group relative overflow-hidden rounded-2xl border bg-slate-100 ${item.removed ? 'border-rose-300 opacity-60 ring-2 ring-rose-100' : 'border-slate-200'}`}>
                        {item.type === 'video' ? (
                          <video src={item.url} className="h-28 w-full object-cover sm:h-32" preload="metadata" />
                        ) : (
                          <img src={item.url} alt={`Media hiện tại ${index + 1}`} className="h-28 w-full object-cover sm:h-32" loading="lazy" />
                        )}
                        {item.type === 'video' ? <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white">▶ Video</span> : null}
                        <button
                          type="button"
                          onClick={() => toggleRemoveExistingMedia(item.key)}
                          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-lg font-black shadow-lg transition ${item.removed ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-white text-rose-600 hover:bg-rose-50'}`}
                          title={item.removed ? 'Giữ lại media này' : 'Xóa media này'}
                        >
                          {item.removed ? '↺' : '×'}
                        </button>
                        {item.removed ? <div className="absolute inset-x-0 bottom-0 bg-rose-500/90 px-2 py-1 text-center text-xs font-bold text-white">Sẽ xóa</div> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                    Bài viết chưa có ảnh/video hiện tại.
                  </div>
                )}

                {(editImages.length || editVideos.length) ? (
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-800">Ảnh/Video mới chọn</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {editImages.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
                          <img src={file.previewUrl} alt={file.name} className="h-28 w-full object-cover sm:h-32" />
                          <button type="button" onClick={() => removeNewImage(index)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-black text-rose-600 shadow-lg hover:bg-rose-50">×</button>
                          <div className="absolute inset-x-0 bottom-0 truncate bg-emerald-500/90 px-2 py-1 text-xs font-bold text-white">Ảnh mới</div>
                        </div>
                      ))}
                      {editVideos.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
                          <video src={file.previewUrl} className="h-28 w-full object-cover sm:h-32" preload="metadata" />
                          <button type="button" onClick={() => removeNewVideo(index)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-black text-rose-600 shadow-lg hover:bg-rose-50">×</button>
                          <div className="absolute inset-x-0 bottom-0 truncate bg-rose-500/90 px-2 py-1 text-xs font-bold text-white">Video mới</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100">+ Thêm ảnh
                    <input key={editImageInputKey} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = createPreviewFiles(Array.from(e.target.files || [])); if (files.length) setEditImages((prev) => [...prev, ...files]); e.target.value = ''; }} />
                  </label>
                  <label className="cursor-pointer rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100">+ Thêm video
                    <input key={editVideoInputKey} type="file" accept="video/*" multiple className="hidden" onChange={async (e) => { const files = Array.from(e.target.files || []); try { await validateEditVideos(files); const previewFiles = createPreviewFiles(files); if (previewFiles.length) setEditVideos((prev) => [...prev, ...previewFiles]); setEditError(''); e.target.value = ''; } catch (err) { setEditError(err.message); e.target.value = ''; } }} />
                  </label>
                </div>
              </div>

              {editError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{editError}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <Button type="button" variant="secondary" disabled={savingEdit} onClick={closeEdit}>Hủy</Button>
              <Button type="submit" disabled={savingEdit}>{savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
            </div>
          </form>
        </div>
      ) : null}


      {reactionModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setReactionModalOpen(false)}>
          <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Ai đã thả cảm xúc</h3>
              <button type="button" onClick={() => setReactionModalOpen(false)} className="text-2xl text-slate-400">×</button>
            </div>
            <div className="my-3 flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setReactionFilter('ALL')} className={`rounded-full px-3 py-1.5 text-xs font-bold ${reactionFilter === 'ALL' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Tất cả</button>
              {REACTIONS.map((r) => <button key={r.type} onClick={() => setReactionFilter(r.type)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${reactionFilter === r.type ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{r.icon} {r.label}</button>)}
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {reactionUsers.filter((u) => reactionFilter === 'ALL' || u.reactionType === reactionFilter).map((u) => { const r = getReaction(u.reactionType); return (
                <div key={`${u.userId}-${u.reactionType}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="flex items-center gap-3"><Avatar src={u.avatar} name={u.name} size="md" /><div><p className="text-sm font-bold text-slate-800 dark:text-white">{u.name}</p><p className="text-xs text-slate-500">@{u.username}</p></div></div><span title={r.label} className="text-xl">{r.icon}</span>
                </div>); })}
              {!reactionUsers.length ? <p className="py-6 text-center text-sm text-slate-500">Chưa có cảm xúc nào.</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL TỐ CÁO CHUYÊN NGHIỆP VỚI HÀNH VI CỤ THỂ */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)}>
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Tố cáo {reportTarget.type === 'POST' ? 'bài viết' : 'bình luận'}
              </h3>
              <button type="button" onClick={() => setIsReportModalOpen(false)} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="mt-4 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn hành vi vi phạm cụ thể:</p>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {VIOLATION_CATEGORIES.map((cat) => (
                  <label key={cat.value} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${selectedViolation === cat.value ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="violationType" 
                      value={cat.value} 
                      checked={selectedViolation === cat.value} 
                      onChange={(e) => setSelectedViolation(e.target.value)}
                      className="mt-0.5 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300" 
                    />
                    <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mô tả chi tiết thêm:</label>
                <textarea 
                  value={reportDetails}
                  onChange={(e) => e.target.value.length <= 1000 && setReportDetails(e.target.value)}
                  placeholder="Cung cấp thêm ngữ cảnh vi phạm để giúp ban quản trị xử lý chính xác..." 
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 p-3 text-sm font-medium outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                />
                <p className="text-right text-[11px] font-semibold text-slate-400">{reportDetails.length}/1000 ký tự</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <Button type="button" variant="secondary" disabled={reporting} onClick={() => setIsReportModalOpen(false)}>Hủy</Button>
              <button 
                type="button" 
                disabled={reporting} 
                onClick={handleConfirmReport}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600 transition disabled:opacity-50"
              >
                {reporting ? 'Đang xử lý...' : 'Gửi tố cáo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;