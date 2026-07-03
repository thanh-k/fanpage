import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmptyState from '../components/common/EmptyState';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { getPostDetail, addComment, deleteMyPost, updateMyPost, toggleLikePost } = useData();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getPostDetail(id).catch(() => null);
    setPost(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-soft">Đang tải chi tiết bài viết...</div>;
  }

  if (!post) {
    return <EmptyState title="Không tìm thấy bài viết" description="Bài viết có thể đã bị xóa hoặc không còn tồn tại." />;
  }

  const handleAddComment = async (payload) => {
    const createdComment = await addComment(payload);
    setPost((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), createdComment],
      commentCount: Number(prev.commentCount || 0) + 1
    }));
  };

  const goBackToFeed = () => {
    navigate('/', {
      replace: false,
      state: {
        restoreFeed: true,
        targetPostId: location.state?.targetPostId || id
      }
    });
  };

  const handleDeletePost = async (postId) => {
    await deleteMyPost(postId);
    navigate('/', { replace: true });
  };

  const handleUpdatePost = async (postId, payload) => {
    const updatedPost = await updateMyPost(postId, payload);
    setPost(updatedPost);
  };

  const handleToggleLike = async (postId, reactionType = 'LIKE') => {
    const result = await toggleLikePost(postId, reactionType);
    setPost((prev) => ({
      ...prev,
      isLikedByCurrentUser: result.liked,
      likesCount: result.likesCount,
      currentReactionType: result.reactionType,
      reactionCounts: result.reactionCounts || {}
    }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        type="button"
        onClick={goBackToFeed}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <span>←</span>
        <span>Quay lại fanpage</span>
      </button>

      <PostCard
        post={post}
        currentUserId={currentUser?.id}
        onAddComment={handleAddComment}
        onDeletePost={handleDeletePost}
        onUpdatePost={handleUpdatePost}
        onToggleLike={handleToggleLike}
        defaultOpenComments
        detailMedia
      />
    </div>
  );
};

export default PostDetailPage;
