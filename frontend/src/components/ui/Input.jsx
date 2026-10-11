import clsx from 'clsx';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const Input = forwardRef(({ type = 'text', placeholder, value, onChange, className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(
          'w-full px-4 py-2 rounded-md bg-telegram-surface border focus:outline-none transition-colors text-white placeholder-gray-400',
          error ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-telegram-blue',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  error: PropTypes.string,
};

export default Input;