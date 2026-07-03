export const formatDateTime = (value) => {
  if (!value) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

export const formatDateOnly = (value) => {
  if (!value) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium'
  }).format(new Date(value));
};
