import PropTypes from 'prop-types';

const Badge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="bg-telegram-blue text-white text-xs font-bold px-2 py-1 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  );
};

Badge.propTypes = { count: PropTypes.number };
export default Badge;