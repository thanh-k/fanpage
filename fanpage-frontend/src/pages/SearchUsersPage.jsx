import Avatar from '../components/common/Avatar';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FriendActionButton from '../components/user/FriendActionButton';
import searchService from '../services/searchService';

const SearchUsersPage = () => {
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setUsers([]); setPosts([]); return;
    }
    setLoading(true);
    try {
      setError('');
      const result = await searchService.globalSearch(trimmed);
      setUsers(result.users || []);
      setPosts(result.posts || []);
    } catch (err) {
      setError(err?.message || 'Không thể tìm kiếm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => search(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  const showUsers = tab === 'ALL' || tab === 'USERS';
  const showPosts = tab === 'ALL' || tab === 'POSTS';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900/90">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tìm kiếm toàn hệ thống</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tìm người dùng và bài viết. Kết quả người dùng được ưu tiên hiển thị trước.</p>
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm người dùng, bài viết, nội dung..." className="mt-5 w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <div className="mt-4 flex gap-2">
          {[['ALL','Tất cả'],['USERS','Người dùng'],['POSTS','Bài viết']].map(([value,label]) => (
            <button key={value} onClick={() => setTab(value)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === value ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{label}</button>
          ))}
        </div>
      </section>

      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">{error}</div> : null}
      {loading ? <div className="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-soft dark:bg-slate-900">Đang tìm kiếm...</div> : null}
      {!loading && keyword.trim() && !users.length && !posts.length ? <div className="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-soft dark:bg-slate-900">Không tìm thấy kết quả phù hợp.</div> : null}

      {showUsers && users.length ? <section className="space-y-3"><h2 className="text-lg font-black text-slate-800 dark:text-white">Người dùng</h2>{users.map((user) => (
        <div key={user.id} className="flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/90">
          <div className="flex min-w-0 items-center gap-4"><Avatar src={user.avatar} name={user.name} provider={user.provider} size="lg" className="h-14 w-14" /><div className="min-w-0"><Link to={`/user/${user.id}`} className="text-base font-bold text-slate-900 hover:text-sky-600 dark:text-white">{user.name}</Link><p className="text-sm text-slate-500">@{user.username}</p><p className="mt-1 line-clamp-1 text-xs text-slate-400">{user.bio || 'Chưa có giới thiệu.'}</p></div></div><FriendActionButton user={user} />
        </div>))}</section> : null}

      {showPosts && posts.length ? <section className="space-y-3"><h2 className="text-lg font-black text-slate-800 dark:text-white">Bài viết</h2>{posts.map((post) => (
        <Link key={post.id} to={`/posts/${post.id}`} className="block rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-soft hover:ring-2 hover:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/90"><div className="flex items-center gap-3"><Avatar src={post.author?.avatar} name={post.authorDisplayName} size="md" /><div><p className="font-bold text-slate-900 dark:text-white">{post.authorDisplayName}</p><p className="text-xs text-slate-400">{post.commentCount || 0} bình luận · {post.likesCount || 0} cảm xúc</p></div></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{post.content || 'Bài viết có đính kèm media.'}</p></Link>
      ))}</section> : null}
    </div>
  );
};
export default SearchUsersPage;
