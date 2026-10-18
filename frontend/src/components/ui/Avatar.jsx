import { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Avatar = ({ src, alt, size = 'md', online, className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-28 h-28 text-3xl',
    '2xl': 'w-32 h-32 text-4xl'
  };

  const [imgError, setImgError] = useState(false);

  const getFullAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const avatarSrc = getFullAvatarUrl(src);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className={clsx('relative inline-block rounded-full select-none', sizes[size] || sizes.md, className)}>
      {avatarSrc && !imgError ? (
        <img
          src={avatarSrc}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full shadow-inner"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-telegram-blue text-white rounded-full font-semibold shadow-inner">
          {getInitial(alt)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-telegram-dark rounded-full"></span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  online: PropTypes.bool,
  className: PropTypes.string,
};

export default Avatar;