import { resolveMediaUrl, getInitials, shouldUseImageAvatar } from '../../utils/media';

const sizeClassMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-24 w-24 text-3xl'
};

const radiusClassMap = {
  full: 'rounded-full',
  xl: 'rounded-2xl'
};

const Avatar = ({
  src,
  name = 'User',
  provider,
  size = 'md',
  rounded = 'full',
  className = '',
  imgClassName = ''
}) => {
  const baseClass = `${sizeClassMap[size] || sizeClassMap.md} ${radiusClassMap[rounded] || radiusClassMap.full} flex shrink-0 items-center justify-center bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-300 font-bold text-white shadow-sm ring-2 ring-sky-100 ${className}`;

  if (shouldUseImageAvatar(src, provider)) {
    return (
      <img
        src={resolveMediaUrl(src)}
        alt={name}
        className={`${baseClass} object-cover ${imgClassName}`}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return <span className={baseClass}>{getInitials(name)}</span>;
};

export default Avatar;
