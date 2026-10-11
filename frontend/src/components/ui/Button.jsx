import clsx from 'clsx';
import PropTypes from 'prop-types';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className, disabled }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none';
  const variants = {
    primary: 'bg-telegram-blue text-white hover:bg-blue-600',
    secondary: 'bg-telegram-surface text-white hover:bg-telegram-message',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-white hover:bg-telegram-surface'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseClasses, variants[variant], disabled && 'opacity-50 cursor-not-allowed', className)}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;