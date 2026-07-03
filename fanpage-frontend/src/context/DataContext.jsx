import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import postService from '../services/postService';
import commentService from '../services/commentService';
import userService from '../services/userService';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { currentUser, reloadCurrentUser } = useAuth();
  const [lastRefreshAt, setLastRefreshAt] = useState(() => new Date().toISOString());

  const refreshData = useCallback(async () => {
    setLastRefreshAt(new Date().toISOString());
    await reloadCurrentUser().catch(() => null);
  }, [reloadCurrentUser]);

  const createPost = async ({ content, isAnonymous, images = [], videos = [] }) => {
    const createdPost = await postService.createPost({ content, isAnonymous, images, videos });
    await refreshData();
    return createdPost;
  };

  const addComment = async ({ postId, content, parentId = null }) => {
    const createdComment = await commentService.createComment({ postId, content, parentId });
    return createdComment;
  };

  const toggleLikePost = async (postId, reactionType = 'LIKE') => {
    return postService.toggleLike(postId, reactionType);
  };

  const updateMyPost = async (postId, payload) => {
    return postService.updatePost(postId, payload);
  };

  const deleteMyPost = async (postId) => {
    await postService.deletePost(postId);
  };

  const getPostDetail = async (postId) => postService.getPostById(postId);

  const getMyPosts = async () => {
    const result = await postService.getMyPosts({ page: 0, size: 100 });
    return result.items;
  };

  const getPublicPostsByUserId = async (userId) => {
    const result = await postService.getPublicPostsByUserId(userId, { page: 0, size: 100 });
    return result.items;
  };

  const getPublicUserProfile = async (userId) => userService.getPublicUserProfile(userId);

  const getFeedPosts = async ({ page = 0, pageSize = 8 } = {}) => {
    return postService.getFeed({ page, size: pageSize });
  };

  const value = useMemo(
    () => ({
      currentUser,
      lastRefreshAt,
      refreshData,
      createPost,
      addComment,
      toggleLikePost,
      updateMyPost,
      deleteMyPost,
      getPostDetail,
      getMyPosts,
      getPublicPostsByUserId,
      getPublicUserProfile,
      getFeedPosts
    }),
    [currentUser, lastRefreshAt, refreshData]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
