import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { formatDateTime } from '../../utils/formatDate';
import Avatar from '../common/Avatar';

const CommentItem = ({ comment, replies, onReportComment, onReply }) => {
  const [replying, setReplying] = useState(false);
  const [content, setContent] = useState('');
  const [openReplies, setOpenReplies] = useState(true);

  const submitReply = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    await onReply?.(comment.id, trimmed);
    setContent('');
    setReplying(false);
    setOpenReplies(true);
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar src={comment.author?.avatar} name={comment.author?.name} provider={comment.author?.provider} size="md" />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Link to={`/user/${comment.author?.id}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 dark:text-white">{comment.author?.name || 'Người dùng'}</Link>
            <div className="flex items-center gap-2"><span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>{onReportComment ? <button onClick={() => onReportComment(comment.id)} className="text-xs font-semibold text-rose-500 hover:text-rose-600">Tố cáo</button> : null}</div>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{comment.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 pl-2 text-xs font-bold text-slate-500">
          <button type="button" onClick={() => setReplying((prev) => !prev)} className="hover:text-sky-600">Trả lời</button>
          {replies.length ? <button type="button" onClick={() => setOpenReplies((prev) => !prev)} className="hover:text-sky-600">{openReplies ? 'Ẩn' : 'Xem'} {replies.length} trả lời</button> : null}
        </div>
        {replying ? <form onSubmit={submitReply} className="mt-2 flex gap-2"><input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viết trả lời..." className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-sky-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700" /><button className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white">Gửi</button></form> : null}
        {openReplies && replies.length ? <div className="mt-3 space-y-3 border-l-2 border-slate-100 pl-3 dark:border-slate-700">{replies.map((reply) => <CommentItem key={reply.id} comment={reply} replies={[]} onReportComment={onReportComment} onReply={onReply} />)}</div> : null}
      </div>
    </div>
  );
};

const CommentList = ({ comments = [], onReportComment, onReply }) => {
  const { roots, groupedReplies } = useMemo(() => {
    const roots = [];
    const groupedReplies = new Map();
    comments.forEach((comment) => {
      if (comment.parentId) {
        groupedReplies.set(comment.parentId, [...(groupedReplies.get(comment.parentId) || []), comment]);
      } else {
        roots.push(comment);
      }
    });
    return { roots, groupedReplies };
  }, [comments]);

  if (!comments.length) return null;
  return <div className="space-y-3">{roots.map((comment) => <CommentItem key={comment.id} comment={comment} replies={groupedReplies.get(comment.id) || []} onReportComment={onReportComment} onReply={onReply} />)}</div>;
};
export default CommentList;
