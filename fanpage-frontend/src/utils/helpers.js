export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const maskEmail = (email = '') => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return '***';

  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
};

export const readFilesAsDataUrls = async (files = []) => {
  const readers = Array.from(files).map(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsDataURL(file);
      })
  );

  return Promise.all(readers);
};
