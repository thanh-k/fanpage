import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmptyState from '../components/common/EmptyState';
import PostList from '../components/post/PostList';
import ProfileHeader from '../components/user/ProfileHeader';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const UserProfilePage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getPublicUserProfile, getPublicPostsByUserId, addComment, toggleLikePost } = useData();
  const [user, setUser] = useState(null);
  const [publicPosts, setPublicPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profile, posts] = await Promise.all([getPublicUserProfile(id), getPublicPostsByUserId(id)]);
      setUser(profile);
      setPublicPosts(posts);
    } catch (error) {
      setUser(null);
      setPublicPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const publicLikes = publicPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);

  if (loading) {
    return <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-soft">Đang tải hồ sơ công khai...</div>;
  }

  if (!user) {
    return <EmptyState title="Không tìm thấy người dùng" description="User bạn đang tìm không tồn tại hoặc đã bị xóa." />;
  }

  if (currentUser?.id === Number(id)) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Đây là hồ sơ của bạn</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bạn có thể xem đầy đủ thông tin tại trang{' '}
          <Link to="/profile" className="font-semibold text-blue-600 hover:text-blue-700">
            Hồ sơ của tôi
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleAddComment = async (payload) => {
    await addComment(payload);
    await loadData();
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

    setPublicPosts((prev) => prev.map(updatePostReaction));
  };

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Số bài viết công khai</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{publicPosts.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Lượt thích công khai</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{publicLikes}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Bài viết công khai</h2>
        <p className="mt-2 text-sm text-slate-500">
          Chỉ hiển thị các bài viết không ẩn danh để đảm bảo quyền riêng tư của người dùng.
        </p>
      </section>

      <PostList
        posts={publicPosts}
        currentUserId={currentUser?.id}
        onAddComment={handleAddComment}
        onToggleLike={handleToggleLike}
        showActions
        emptyTitle="Người dùng này chưa có bài viết công khai"
        emptyDescription="Khi họ đăng bài hiện tên, bài viết sẽ xuất hiện tại đây."
      />
    </div>
  );
};

export default UserProfilePage;
