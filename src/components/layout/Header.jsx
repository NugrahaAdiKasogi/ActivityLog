import { useLocation } from 'react-router';

const Header = ({ setSidebarOpen }) => {
  const { pathname } = useLocation();

  const titles = {
    '/': 'Dashboard',
    '/logs': 'Logs',
    '/student': 'Student',
  };

  const title = titles[pathname];
  return (
    <div>
      <header className="bg-white flex justify-between p-4">
        <button
          className="p-2 text-xl font-bold lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          =
        </button>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="w-10 h-10 rounded-md overflow-hidden border-2 border-slate-700 cursor-pointer hover:border-white transition">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nugi"
            alt="User Profile"
          />
        </div>
      </header>
    </div>
  );
};

export default Header;
