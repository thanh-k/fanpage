import { useState } from 'react';
import Button from '../common/Button';
import friendService from '../../services/friendService';

const labelByStatus = {
  SELF: 'Đây là bạn',
  FRIEND: 'Bạn bè',
  PENDING_SENT: 'Đã gửi lời mời',
  PENDING_RECEIVED: 'Đang chờ bạn xác nhận',
  NONE: 'Kết bạn'
};

const FriendActionButton = ({ user, onChanged }) => {
  const [status, setStatus] = useState(user?.friendshipStatus || 'NONE');
  const [loading, setLoading] = useState(false);

  if (!user || status === 'SELF') return null;

  const handleSend = async () => {
    setLoading(true);
    try {
      await friendService.sendRequest(user.id);
      setStatus('PENDING_SENT');
      onChanged?.();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Bạn muốn hủy kết bạn với người này?')) return;
    setLoading(true);
    try {
      await friendService.removeFriend(user.id);
      setStatus('NONE');
      onChanged?.();
    } finally {
      setLoading(false);
    }
  };

  if (status === 'FRIEND') {
    return (
      <Button variant="secondary" disabled={loading} onClick={handleRemove}>
        Bạn bè
      </Button>
    );
  }

  if (status === 'PENDING_SENT' || status === 'PENDING_RECEIVED') {
    return (
      <Button variant="secondary" disabled>
        {labelByStatus[status]}
      </Button>
    );
  }

  return (
    <Button disabled={loading} onClick={handleSend}>
      {loading ? 'Đang gửi...' : labelByStatus[status] || 'Kết bạn'}
    </Button>
  );
};

export default FriendActionButton;
