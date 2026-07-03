import { useState } from 'react';
import Button from '../common/Button';

const CommentForm = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    try {
      await onSubmit(content);
      setContent('');
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi bình luận.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-end gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="Viết bình luận..."
          className="min-h-[52px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <Button type="submit" className="rounded-2xl px-5 py-3">
          Gửi
        </Button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
};

export default CommentForm;
