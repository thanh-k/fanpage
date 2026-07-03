const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
};

export const getInitials = (name = 'User') => {
  const normalized = String(name || 'User').trim().replace(/\s+/g, ' ');
  if (!normalized) return 'US';

  const removeAccent = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '');

  const parts = normalized.split(' ');

  if (parts.length >= 2) {
    const first = removeAccent(parts[0]).charAt(0) || 'U';
    const last = removeAccent(parts[parts.length - 1]).charAt(0) || 'S';
    return `${first}${last}`.toUpperCase();
  }

  const compact = removeAccent(parts[0]).toUpperCase();
  if (compact.length >= 2) return compact.slice(0, 2);
  if (compact.length === 1) return `${compact}${compact}`;
  return 'US';
};

const isGeneratedAvatarUrl = (url = '') => {
  return url.includes('ui-avatars.com') || url.includes('i.pravatar.cc');
};

export const shouldUseImageAvatar = (url, provider) => {
  if (!url || isGeneratedAvatarUrl(url)) {
    return false;
  }

  if (url.startsWith('/uploads/avatars/') || url.startsWith('blob:')) {
    return true;
  }

  if (url.startsWith('data:image/')) {
    return false;
  }

  if (provider === 'GOOGLE' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return true;
  }

  if (!provider && (url.startsWith('http://') || url.startsWith('https://'))) {
    return true;
  }

  return false;
};

export const getFallbackAvatar = (name = 'User') => {
  const initials = getInitials(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <rect width="150" height="150" rx="75" fill="#0ea5e9"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="white">${initials}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
