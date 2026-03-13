import { NavLink } from 'react-router';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: 1, name: 'Dashboard', icon: '📚' , path:"/"},
    { id: 2, name: 'Logs', icon: '🧑‍🏫' , path:"logs"},
    { id: 3, name: 'Student', icon: '🧑‍🎓' , path:"student"},
  ];

  return (
    <div>
      {/* sidebar */}
      <div
        className={`fixed bg-white h-screen w-64 shadow 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} 
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex justify-between p-4 border-b ">
          <div className="font-bold text-xl ">Logo</div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            X
          </button>
        </div>
        {/* navigation bar */}
        <div className="p-4 space-y-2 ">
          {navItems.map((item) => (
            <div key={`nav-${item.id}`} className="flex p-2">
              <div className="text-xl mr-2">{item.icon}</div>
              <NavLink to={item.path} className="text-xl">
                {item.name}
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
