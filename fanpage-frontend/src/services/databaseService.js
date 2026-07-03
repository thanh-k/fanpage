import initialUsers from '../data/users';
import initialPosts from '../data/posts';
import initialComments from '../data/comments';
import localStorageService from './localStorageService';
import { STORAGE_KEYS } from '../utils/storageKeys';

const clone = (data) => JSON.parse(JSON.stringify(data));

const ensureSeedData = () => {
  const users = localStorageService.get(STORAGE_KEYS.USERS, null);
  const posts = localStorageService.get(STORAGE_KEYS.POSTS, null);
  const comments = localStorageService.get(STORAGE_KEYS.COMMENTS, null);

  if (!users) localStorageService.set(STORAGE_KEYS.USERS, clone(initialUsers));
  if (!posts) localStorageService.set(STORAGE_KEYS.POSTS, clone(initialPosts));
  if (!comments) localStorageService.set(STORAGE_KEYS.COMMENTS, clone(initialComments));
};

const databaseService = {
  initialize() {
    ensureSeedData();
  },

  getUsers() {
    ensureSeedData();
    return localStorageService.get(STORAGE_KEYS.USERS, []);
  },

  saveUsers(users) {
    localStorageService.set(STORAGE_KEYS.USERS, users);
  },

  getPosts() {
    ensureSeedData();
    return localStorageService.get(STORAGE_KEYS.POSTS, []);
  },

  savePosts(posts) {
    localStorageService.set(STORAGE_KEYS.POSTS, posts);
  },

  getComments() {
    ensureSeedData();
    return localStorageService.get(STORAGE_KEYS.COMMENTS, []);
  },

  saveComments(comments) {
    localStorageService.set(STORAGE_KEYS.COMMENTS, comments);
  }
};

export default databaseService;
