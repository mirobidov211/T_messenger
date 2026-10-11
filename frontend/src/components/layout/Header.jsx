import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="p-4 bg-telegram-dark border-b border-gray-800 flex justify-between items-center">
      <h1 className="text-xl font-bold">Messenger</h1>
      <div>{user?.username}</div>
    </header>
  );
};
export default Header;