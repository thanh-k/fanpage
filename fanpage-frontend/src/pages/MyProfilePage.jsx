import { useEffect, useMemo, useState } from 'react';
import ProfileHeader from '../components/user/ProfileHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import userService from '../services/userService';
import Avatar from '../components/common/Avatar';
import { resolveMediaUrl } from '../utils/media';

const MyProfilePage = () => {
  const { currentUser, reloadCurrentUser, logout } = useAuth();
  const { getMyPosts } = useData();

  const [myProfile, setMyProfile] = useState(currentUser);
  const [myPosts, setMyPosts] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionStep, setDeletionStep] = useState(1);
  const [deletionConfirmChecked, setDeletionConfirmChecked] = useState(false);
  const [deletionConfirmText, setDeletionConfirmText] = useState('');
  const [sendingDeletionRequest, setSendingDeletionRequest] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    gender: 'PRIVATE'
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, posts] = await Promise.all([
          userService.getMyProfile(),
          getMyPosts()
        ]);

        setMyProfile(profile);
        setMyPosts(posts);

        setForm({
          name: profile?.name || '',
          email: profile?.email || '',
          bio: profile?.bio || '',
          location: profile?.location || '',
          gender: profile?.gender || 'PRIVATE'
        });
      } catch (fetchError) {
        setError(fetchError.message || 'Không thể tải thông tin cá nhân.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const totalLikes = useMemo(() => {
    return myPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
  }, [myPosts]);

  const anonymousPostsCount = useMemo(() => {
    return myPosts.filter((post) => post.isAnonymous).length;
  }, [myPosts]);

  const namedPostsCount = useMemo(() => {
    return myPosts.filter((post) => !post.isAnonymous).length;
  }, [myPosts]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const resetForm = () => {
    setForm({
      name: myProfile?.name || '',
      email: myProfile?.email || '',
      bio: myProfile?.bio || '',
      location: myProfile?.location || '',
      gender: myProfile?.gender || 'PRIVATE'
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setError('');
  };

  const resetDeletionModal = () => {
    setShowDeletionModal(false);
    setDeletionStep(1);
    setDeletionReason('');
    setDeletionConfirmChecked(false);
    setDeletionConfirmText('');
  };

  const handleOpenDeletionModal = () => {
    setError('');
    setSuccessMsg('');
    setDeletionStep(1);
    setDeletionReason('');
    setDeletionConfirmChecked(false);
    setDeletionConfirmText('');
    setShowDeletionModal(true);
  };

  const handleRequestAccountDeletion = async () => {
    setError('');
    setSuccessMsg('');
    setSendingDeletionRequest(true);
    try {
      await userService.requestAccountDeletion(deletionReason);
      alert('Yêu cầu hủy tài khoản đã được gửi đến quản trị viên. Hệ thống sẽ đăng xuất tài khoản của bạn.');
      resetDeletionModal();
      logout();
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu hủy tài khoản.');
    } finally {
      setSendingDeletionRequest(false);
    }
  };

  const handleStartEdit = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh đại diện không được lớn hơn 5MB.');
      event.target.value = '';
      return;
    }

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const updatedProfile = await userService.updateMyProfile({
        ...form,
        avatarFile
      });

      setMyProfile(updatedProfile);
      await reloadCurrentUser();
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (submitError) {
      setError(submitError?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar = avatarPreview || myProfile?.avatar;
  const isGoogleAccount = (myProfile?.provider || currentUser?.provider) === 'GOOGLE';
  const profileRole = (myProfile?.role || currentUser?.role || '').toUpperCase();
  const canRequestDeletion = profileRole === 'USER' && myProfile?.accountDeletionRequestStatus !== 'PENDING';

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <ProfileHeader
          user={myProfile || currentUser}
          isPrivateOwner
          actions={
            <>
              <Button type="button" onClick={handleStartEdit}>
                Chỉnh sửa hồ sơ
              </Button>
              {canRequestDeletion ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOpenDeletionModal}
                  className="text-rose-600"
                >
                  Hủy tài khoản
                </Button>
              ) : null}
            </>
          }
        />

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {successMsg ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMsg}
          </div>
        ) : null}

        {myProfile?.accountDeletionRequestStatus === 'PENDING' ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            Bạn đã gửi yêu cầu hủy tài khoản. Vui lòng chờ Admin duyệt.
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Tổng bài viết</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {myPosts.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Bài viết ẩn danh</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {anonymousPostsCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Bài viết hiện tên</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {namedPostsCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Tổng lượt thích nhận được</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalLikes}
            </p>
          </div>
        </section>
      </div>

      {showDeletionModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={() => !sendingDeletionRequest && resetDeletionModal()}
        >
          <div
            className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-500">
                  Account deletion
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  Xác nhận hủy tài khoản
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bạn cần xác nhận 3 lần trước khi gửi yêu cầu. Sau khi gửi yêu cầu, hệ thống sẽ đăng xuất tài khoản của bạn.
                </p>
              </div>

              <button
                type="button"
                onClick={resetDeletionModal}
                disabled={sendingDeletionRequest}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${deletionStep >= step ? 'bg-rose-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>

            {deletionStep === 1 ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                  <strong>Lần xác nhận 1:</strong> Yêu cầu hủy tài khoản sẽ được gửi đến Admin. Nếu Admin duyệt, tài khoản có thể bị xóa vĩnh viễn.
                </div>
                <textarea
                  value={deletionReason}
                  onChange={(event) => setDeletionReason(event.target.value)}
                  rows={3}
                  placeholder="Nhập lý do muốn hủy tài khoản..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
                />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={resetDeletionModal}>
                    Hủy
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDeletionStep(2)}
                    className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white hover:bg-rose-600"
                  >
                    Tôi hiểu, tiếp tục
                  </button>
                </div>
              </div>
            ) : null}

            {deletionStep === 2 ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
                  <strong>Lần xác nhận 2:</strong> Sau khi gửi yêu cầu, bạn sẽ bị đăng xuất khỏi hệ thống để tránh tiếp tục sử dụng tài khoản trong lúc chờ duyệt.
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={deletionConfirmChecked}
                    onChange={(event) => setDeletionConfirmChecked(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Tôi đã hiểu rằng yêu cầu sẽ được gửi đến Admin và tài khoản sẽ đăng xuất sau khi gửi.</span>
                </label>
                <div className="flex justify-between gap-3">
                  <Button type="button" variant="secondary" onClick={() => setDeletionStep(1)}>
                    Quay lại
                  </Button>
                  <button
                    type="button"
                    disabled={!deletionConfirmChecked}
                    onClick={() => setDeletionStep(3)}
                    className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white hover:bg-rose-600 disabled:opacity-50"
                  >
                    Xác nhận lần 2
                  </button>
                </div>
              </div>
            ) : null}

            {deletionStep === 3 ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                  <strong>Lần xác nhận 3:</strong> Nhập chính xác <strong>HUY TAI KHOAN</strong> để gửi yêu cầu hủy tài khoản.
                </div>
                <Input
                  value={deletionConfirmText}
                  onChange={(event) => setDeletionConfirmText(event.target.value)}
                  placeholder="Nhập: HUY TAI KHOAN"
                />
                <div className="flex justify-between gap-3">
                  <Button type="button" variant="secondary" onClick={() => setDeletionStep(2)} disabled={sendingDeletionRequest}>
                    Quay lại
                  </Button>
                  <button
                    type="button"
                    onClick={handleRequestAccountDeletion}
                    disabled={sendingDeletionRequest || deletionConfirmText.trim().toUpperCase() !== 'HUY TAI KHOAN'}
                    className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {sendingDeletionRequest ? 'Đang gửi...' : 'Gửi yêu cầu hủy'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={handleCancelEdit}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">
                Chỉnh sửa hồ sơ
              </h3>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Ảnh đại diện</p>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    {avatarPreview ? (
                      <img
                        src={resolveMediaUrl(avatarPreview)}
                        alt="Avatar preview"
                        className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-sky-100"
                      />
                    ) : (
                      <Avatar
                        src={currentAvatar}
                        name={form.name || myProfile?.name}
                        provider={myProfile?.provider || currentUser?.provider}
                        size="xl"
                        className="mx-auto h-32 w-32 text-4xl ring-4"
                      />
                    )}
                    <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600">
                      Chọn ảnh mới
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">jpg, png, webp, gif · tối đa 5MB</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Tên hiển thị
                    </label>
                    <Input
                      value={form.name}
                      onChange={handleChange('name')}
                      placeholder="Nhập tên hiển thị"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="Nhập email"
                      disabled={isGoogleAccount}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Giới tính
                    </label>
                    <select
                      value={form.gender}
                      onChange={handleChange('gender')}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="PRIVATE">Không muốn nói</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Vị trí
                    </label>
                    <Input
                      value={form.location}
                      onChange={handleChange('location')}
                      placeholder="Ví dụ: TP.HCM"
                    />
                    {isGoogleAccount ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Email của tài khoản Google được giữ nguyên từ Google. Bạn vẫn có thể thay avatar riêng trong hệ thống.
                      </p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Giới thiệu
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={handleChange('bio')}
                      rows={4}
                      placeholder="Viết vài dòng giới thiệu về bạn"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Huỷ
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default MyProfilePage;
