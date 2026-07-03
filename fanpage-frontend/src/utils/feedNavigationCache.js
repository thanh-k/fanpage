const FEED_CACHE_KEY = 'fanpage.home.feed.v1';
const DELETED_POST_IDS_KEY = 'fanpage.deletedPostIds.v1';

export const readDeletedPostIds = () => {
  try {
    const raw = sessionStorage.getItem(DELETED_POST_IDS_KEY) || localStorage.getItem(DELETED_POST_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

export const rememberDeletedPostId = (postId) => {
  if (!postId) return;
  try {
    const next = Array.from(new Set([String(postId), ...readDeletedPostIds()])).slice(0, 300);
    const raw = JSON.stringify(next);
    sessionStorage.setItem(DELETED_POST_IDS_KEY, raw);
    localStorage.setItem(DELETED_POST_IDS_KEY, raw);
  } catch {
    // Ignore storage errors.
  }
};

export const filterDeletedPosts = (posts = []) => {
  const deletedIds = new Set(readDeletedPostIds());
  return Array.isArray(posts) ? posts.filter((post) => !deletedIds.has(String(post?.id))) : [];
};

export const readFeedCache = () => {
  try {
    const raw = sessionStorage.getItem(FEED_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return null;
    return {
      ...parsed,
      posts: filterDeletedPosts(parsed.posts || [])
    };
  } catch {
    return null;
  }
};

export const writeFeedCache = (snapshot = {}) => {
  try {
    const previous = readFeedCache() || {};
    const nextSnapshot = {
      ...previous,
      ...snapshot,
      posts: snapshot.posts ? filterDeletedPosts(snapshot.posts) : previous.posts,
      scrollY: typeof snapshot.scrollY === 'number' ? snapshot.scrollY : window.scrollY,
      updatedAt: Date.now()
    };
    sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify(nextSnapshot));
  } catch {
    // Ignore storage errors, the feed still works normally without cache.
  }
};

export const removePostFromFeedCache = (postId) => {
  if (!postId) return;
  rememberDeletedPostId(postId);
  try {
    const previous = readFeedCache() || {};
    sessionStorage.setItem(
      FEED_CACHE_KEY,
      JSON.stringify({
        ...previous,
        posts: (previous.posts || []).filter((post) => String(post?.id) !== String(postId)),
        updatedAt: Date.now()
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const clearFeedCache = () => {
  try {
    sessionStorage.removeItem(FEED_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
};

export const rememberFeedScroll = (targetPostId = null) => {
  writeFeedCache({
    scrollY: window.scrollY,
    targetPostId: targetPostId || null
  });
};
