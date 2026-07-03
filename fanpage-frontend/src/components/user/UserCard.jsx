import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import { formatDateOnly } from '../../utils/formatDate';

const UserCard = ({ user }) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <Avatar src={user.avatar} name={user.name} provider={user.provider} size="lg" className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <Link to={`/user/${user.id}`} className="text-base font-semibold text-slate-900 hover:text-blue-600">
            {user.name}
          </Link>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase text-slate-500">Ngày tham gia</p>
          <p className="mt-1 font-medium text-slate-800">{formatDateOnly(user.joinedAt)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase text-slate-500">Bài viết công khai</p>
          <p className="mt-1 font-medium text-slate-800">{user.publicPostsCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
