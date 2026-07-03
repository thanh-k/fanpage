import { formatDateOnly } from '../../utils/formatDate';
import Avatar from '../common/Avatar';
import FriendActionButton from './FriendActionButton';

const getGenderInfo = (gender) => {
  switch ((gender || 'PRIVATE').toUpperCase()) {
    case 'MALE':
      return { icon: '♂', label: 'Nam' };
    case 'FEMALE':
      return { icon: '♀', label: 'Nữ' };
    default:
      return { icon: '○', label: 'Không tiết lộ' };
  }
};

const ProfileHeader = ({ user, isPrivateOwner = false, actions = null }) => {
  if (!user) return null;

  const emailValue = user.email || user.emailMasked || 'Không công khai';
  const genderInfo = getGenderInfo(user.gender);

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <Avatar
          src={user.avatar}
          name={user.name}
          provider={user.provider}
          size="xl"
          className="ring-4"
        />
        <div className="flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {actions}
              {!isPrivateOwner ? <FriendActionButton user={user} /> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white p-4 ring-1 ring-sky-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-800">{emailValue}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-white p-4 ring-1 ring-cyan-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Ngày tham gia</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{formatDateOnly(user.joinedAt)}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-white p-4 ring-1 ring-violet-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Giới tính</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                <span className="text-base">{genderInfo.icon}</span>
                {genderInfo.label}
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white p-4 ring-1 ring-amber-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Địa điểm</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{user.location || 'Chưa cập nhật'}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4 ring-1 ring-emerald-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Quyền riêng tư</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {isPrivateOwner ? 'Đầy đủ thông tin' : 'Đã ẩn dữ liệu nhạy cảm'}
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">{user.bio || 'Chưa có giới thiệu.'}</p>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
