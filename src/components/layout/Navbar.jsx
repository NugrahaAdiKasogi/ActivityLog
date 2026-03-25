import { NavLink } from "react-router";
// Kita pakai Heroicons v2 Outline dari react-icons
import {
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineAcademicCap,
  
} from "react-icons/hi2";

import { HiOutlineLogout } from "react-icons/hi";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: 1, name: "Dashboard", icon: HiOutlineUserGroup, path: "/" },
    {
      id: 2,
      name: "Logs",
      icon: HiOutlineClipboardDocumentList,
      path: "/logs",
    },
    { id: 3, name: "Student", icon: HiOutlineAcademicCap, path: "/student" },
  ];

  return (
    <div
      className={`fixed bg-white h-screen w-64 shadow-lg lg:shadow-none border-r border-gray-100 p-6 flex flex-col transition-transform duration-300 ease-in-out z-40 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      {/* Bagian Logo / Judul - Lebih Clean */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <div className="bg-blue-600 p-3 rounded-full shadow-md shadow-blue-200">
          <HiOutlineAcademicCap className="text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Acti<span className="text-blue-600">Log</span>
        </h1>
      </div>

      {/* Nav Items - Meniru gaya Rounded & Outline Blue */}
      <div className="flex-1 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={`nav-${item.id}`}
            to={item.path}
            onClick={() => setSidebarOpen(false)} // Tutup sidebar di HP
            // Trik dynamic class Tailwind v4 untuk active state
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 
              font-medium rounded-full transition-all duration-200
              ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-inner shadow-blue-100" // Aktif: Background Biru Muda, Teks Biru
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600" // Normal
              }
            `}
          >
            {/* Pemanggilan Ikon sebagai Komponen Dinamis */}
            <item.icon className="text-2xl" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Bagian Bawah (Logout) - Rounded-xl */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <button className="flex items-center gap-4 px-5 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition font-medium">
          <HiOutlineLogout className="text-2xl" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
