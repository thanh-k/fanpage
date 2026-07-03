import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostForm from '../components/post/PostForm';
import PostList from '../components/post/PostList';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { clearFeedCache, filterDeletedPosts, readFeedCache, removePostFromFeedCache, writeFeedCache } from '../utils/feedNavigationCache';

const PAGE_SIZE = 8;
const PRELOAD_OFFSET = 2;
const HomePage = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const {
    createPost,
    addComment,
    deleteMyPost,
    updateMyPost,
    toggleLikePost,
    refreshData,
    getFeedPosts
  } = useData();

  const cachedFeedRef = useRef(readFeedCache());
  const [posts, setPosts] = useState(() => filterDeletedPosts(cachedFeedRef.current?.posts || []));
  const [page, setPage] = useState(() => cachedFeedRef.current?.page || 0);
  const [hasMore, setHasMore] = useState(() => cachedFeedRef.current?.hasMore ?? true);
  const [loading, setLoading] = useState(() => !(cachedFeedRef.current?.posts?.length));
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const restoredScrollRef = useRef(false);
  const loadMoreRef = useRef(null);

  const triggerIndex = Math.max(0, posts.length - PRELOAD_OFFSET);

  const loadFeed = async ({ targetPage = 0, reset = false } = {}) => {
    const setter = reset ? setLoading : setLoadingMore;
    setter(true);

    try {
      setLoadError('');
      const result = await getFeedPosts({
        page: targetPage,
        pageSize: PAGE_SIZE
      });

      setPosts((prev) => filterDeletedPosts(reset ? result.items : [...prev, ...result.items]));
      setHasMore(result.hasMore);
      setPage(targetPage);
    } catch (error) {
      setLoadError(error?.message || 'Không thể tải bảng tin.');
      if (reset) {
        setPosts([]);
      }
    } finally {
      setter(false);
    }
  };


  useEffect(() => {
    const handleAdminDeletedPost = (event) => {
      const postId = event?.detail?.postId;
      if (!postId) return;
      removePostFromFeedCache(postId);
      setPosts((prev) => prev.filter((post) => String(post.id) !== String(postId)));
    };

    const syncDeletedPosts = () => {
      setPosts((prev) => filterDeletedPosts(prev));
    };

    window.addEventListener('fanpage:post-deleted', handleAdminDeletedPost);
    window.addEventListener('focus', syncDeletedPosts);
    const syncTimer = window.setInterval(syncDeletedPosts, 1000);

    return () => {
      window.removeEventListener('fanpage:post-deleted', handleAdminDeletedPost);
      window.removeEventListener('focus', syncDeletedPosts);
      window.clearInterval(syncTimer);
    };
  }, []);

  useEffect(() => {
    if (!cachedFeedRef.current?.posts?.length) {
      loadFeed({ targetPage: 0, reset: true });
      return;
    }

    if (!restoredScrollRef.current) {
      restoredScrollRef.current = true;
      const scrollY = Number(cachedFeedRef.current.scrollY || 0);
      const targetPostId = location.state?.targetPostId || cachedFeedRef.current?.targetPostId;
      const restore = () => {
        const target = targetPostId ? document.getElementById(`post-card-${targetPostId}`) : null;
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: 'auto' });
          return;
        }
        window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
      };
      requestAnimationFrame(() => {
        restore();
        setTimeout(restore, 0);
        setTimeout(restore, 120);
        setTimeout(restore, 350);
        setTimeout(restore, 800);
      });
    }
  }, [location.state]);

  useEffect(() => {
    writeFeedCache({ posts, page, hasMore, scrollY: window.scrollY });
  }, [posts, page, hasMore]);

  useEffect(() => {
    const saveScroll = () => {
      writeFeedCache({ posts, page, hasMore, scrollY: window.scrollY });
    };

    window.addEventListener('beforeunload', saveScroll);
    window.addEventListener('pagehide', saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener('beforeunload', saveScroll);
      window.removeEventListener('pagehide', saveScroll);
    };
  }, [posts, page, hasMore]);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current || loadingMore || loading) {
      return undefined;
    }

    const element = loadMoreRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadFeed({ targetPage: page + 1 });
        }
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: '260px 0px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, page, loadingMore, loading, posts.length]);

  const handleReloadFeed = async () => {
    setReloading(true);
    clearFeedCache();
    await refreshData();
    await loadFeed({ targetPage: 0, reset: true });
    setReloading(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleCreatePost = async (payload) => {
    const createdPost = await createPost(payload);
    setPosts((prev) => [createdPost, ...prev]);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleAddComment = async (payload) => {
    const createdComment = await addComment(payload);

    setPosts((prev) => prev.map((post) => {
      if (post.id !== payload.postId) return post;

      const existingComments = Array.isArray(post.comments) ? post.comments : [];
      return {
        ...post,
        comments: [...existingComments, createdComment],
        commentCount: Number(post.commentCount || 0) + 1
      };
    }));
  };

  const handleDeletePost = async (postId) => {
    await deleteMyPost(postId);
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleUpdatePost = async (postId, payload) => {
    const updatedPost = await updateMyPost(postId, payload);
    setPosts((prev) => prev.map((post) => (post.id === postId ? updatedPost : post)));
  };

  const handleToggleLike = async (postId, reactionType = 'LIKE') => {
    const result = await toggleLikePost(postId, reactionType);

    const updatePostReaction = (post) =>
      post.id === postId
        ? {
            ...post,
            isLikedByCurrentUser: result.liked,
            likesCount: result.likesCount,
            currentReactionType: result.reactionType,
            reactionCounts: result.reactionCounts || {}
          }
        : post;

    setPosts((prev) => prev.map(updatePostReaction));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-0 sm:space-y-6 md:px-0">
      <section className="overflow-hidden rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur-sm sm:rounded-[32px] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Bảng tin mới
            </h1>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleReloadFeed}
            disabled={reloading || loading}
          >
            {reloading ? 'Đang làm mới...' : 'Làm mới bảng tin'}
          </Button>
        </div>
      </section>

      <PostForm onSubmit={handleCreatePost} />

      {loadError ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-soft">
          {loadError}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[28px] bg-white/85 p-6 text-center text-sm text-slate-500 shadow-soft">
          Đang tải dữ liệu...
        </div>
      ) : (
        <PostList
          posts={posts}
          currentUserId={currentUser?.id}
          onAddComment={handleAddComment}
          onDeletePost={handleDeletePost}
          onUpdatePost={handleUpdatePost}
          onToggleLike={handleToggleLike}
          loadMoreTriggerRef={hasMore ? loadMoreRef : null}
          triggerIndex={triggerIndex}
          emptyTitle="Chưa có bài viết nào"
          emptyDescription="Hãy tạo bài viết đầu tiên cho Discussion Board này."
        />
      )}

      {loadingMore ? (
        <div className="rounded-[28px] border border-dashed border-sky-200 bg-white/85 p-4 text-center text-sm text-slate-500 shadow-soft">
          Đang tải thêm bài viết...
        </div>
      ) : null}

      {!loading && !hasMore && posts.length ? (
        <div className="rounded-[28px] bg-white/85 p-4 text-center text-sm text-slate-500 shadow-soft">
          Bạn đã xem hết bài viết hiện có trên bảng tin.
        </div>
      ) : null}
    </div>
  );
};

export default HomePage;
