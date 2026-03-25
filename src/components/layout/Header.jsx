import { useLocation, Link } from 'react-router';
// Import ikon modern
import { HiOutlineBars3, HiOutlineBell, HiChevronDown } from 'react-icons/hi2';

const Header = ({ setSidebarOpen }) => {
  const { pathname } = useLocation();

  // Menambahkan /profile untuk persiapan halaman profil
  const titles = {
    '/': 'Dashboard',
    '/logs': 'Activity Logs',
    '/student': 'Data Siswa',
    '/profile': 'Profil Saya',
  };

  // Default ke 'Dashboard' jika rute tidak ditemukan di object titles
  const title = titles[pathname] || 'Dashboard';

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 lg:px-10 flex justify-between items-center border-b border-gray-100 shadow-sm shadow-gray-100/50 transition-all">
      
      {/* BAGIAN KIRI: Hamburger & Judul */}
      <div className="flex items-center gap-4">
        {/* Tombol Hamburger (Hanya muncul di Mobile/Tablet) */}
        <button
          className="p-2 -ml-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <HiOutlineBars3 className="text-2xl" />
        </button>
        
        {/* Judul Halaman */}
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-gray-800 tracking-tight hidden sm:block">
            {title}
          </h1>
        </div>
      </div>

      {/* BAGIAN KANAN: Notifikasi & Profil */}
      <div className="flex items-center gap-4 lg:gap-6">
        
        {/* Tombol Notifikasi (Pemanis UI Modern) */}
        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50">
          <HiOutlineBell className="text-2xl" />
          {/* Titik merah notifikasi */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Garis Pembatas vertical */}
        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

        {/* Tombol Profil (Bisa diklik menuju Halaman Profile) */}
        <Link 
          to="/profile" 
          className="flex items-center gap-3 p-1 pr-3 sm:pr-4 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition group cursor-pointer"
        >
          {/* Avatar (Heavy Rounded / Full) */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 border-2 border-white shadow-sm group-hover:border-blue-100 transition flex-shrink-0">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nugi&backgroundColor=e0f2fe"
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Info Text (Sembunyi di layar HP yang sangat kecil agar tidak sempit) */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition leading-tight">Nugi</p>
            <p className="text-[10px] font-medium text-gray-400 leading-tight">Guru IT</p>
          </div>

          {/* Ikon Chevron Down */}
          <HiChevronDown className="text-gray-400 group-hover:text-blue-600 transition hidden sm:block" />
        </Link>

      </div>
    </header>
  );
};

export default Header;