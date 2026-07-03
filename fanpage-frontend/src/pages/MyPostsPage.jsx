import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PostList from '../components/post/PostList';

const MyPostsPage = () => {
  const { currentUser } = useAuth();
  const { getMyPosts, addComment, deleteMyPost, updateMyPost, toggleLikePost } = useData();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyPosts = async () => {
    setLoading(true);
    const items = await getMyPosts();
    setMyPosts(items);
    setLoading(false);
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  const handleAddComment = async (payload) => {
    await addComment(payload);
    await loadMyPosts();
  };

  const handleDeletePost = async (postId) => {
    await deleteMyPost(postId);
    await loadMyPosts();
  };

  const handleUpdatePost = async (postId, payload) => {
    await updateMyPost(postId, payload);
    await loadMyPosts();
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

    setMyPosts((prev) => prev.map(updatePostReaction));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý bài viết của tôi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Xem toàn bộ bài viết bạn đã tạo, phân biệt bài ẩn danh và bài hiện tên, đồng thời có thể xóa hoặc xem lượt thích của từng bài.
        </p>
      </section>

      {loading ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-soft">Đang tải bài viết...</div>
      ) : (
        <PostList
          posts={myPosts}
          currentUserId={currentUser?.id}
          onAddComment={handleAddComment}
          onDeletePost={handleDeletePost}
          onUpdatePost={handleUpdatePost}
          onToggleLike={handleToggleLike}
          emptyTitle="Bạn chưa có bài viết nào"
          emptyDescription="Hãy quay lại fanpage và tạo bài viết đầu tiên của bạn."
        />
      )}
    </div>
  );
};

export default MyPostsPage;
