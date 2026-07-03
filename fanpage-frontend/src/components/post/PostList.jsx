import EmptyState from '../common/EmptyState';
import PostCard from './PostCard';

const PostList = ({
  posts,
  currentUserId,
  onAddComment,
  onDeletePost,
  onUpdatePost,
  onToggleLike,
  showActions = true,
  emptyTitle,
  emptyDescription,
  loadMoreTriggerRef,
  triggerIndex
}) => {
  if (!posts.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-5">
      {posts.map((post, index) => (
        <div key={post.id} ref={index === triggerIndex ? loadMoreTriggerRef : null}>
          <PostCard
            post={post}
            currentUserId={currentUserId}
            onAddComment={onAddComment}
            onDeletePost={onDeletePost}
            onUpdatePost={onUpdatePost}
            onToggleLike={onToggleLike}
            showActions={showActions}
          />
        </div>
      ))}
    </div>
  );
};

export default PostList;
