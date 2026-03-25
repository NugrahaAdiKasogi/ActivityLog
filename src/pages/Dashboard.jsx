import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router"; // Gunakan navigate agar tidak refresh halaman
import { 
  HiOutlineDocumentText, 
  HiOutlineUsers, 
  HiOutlineChartBar, 
  HiOutlineCalendarDays,
  HiOutlineTrophy,
  HiOutlineArrowTrendingDown
} from "react-icons/hi2";

// --- FUNGSI GET STATS TETAP SAMA (TIDAK ADA PERUBAHAN LOGIKA) ---
const getStats = async (levelTop, levelBottom) => {
  const { data: logs, error: logError } = await supabase.from("logs").select("*");
  const { data: students, error: studentError } = await supabase.from("students").select("*");

  if (logError || studentError) {
    console.error("Error fetching dashboard data:", logError || studentError);
    return null;
  }

  const totalNilaiSemuaSiswa = students.reduce((sum, s) => {
    const rataSiswa = (Number(s.nilaiMateri1 || 0) + Number(s.nilaiMateri2 || 0) + Number(s.nilaiMateri3 || 0)) / 3;
    return sum + rataSiswa;
  }, 0);

  const averageNilai = students.length > 0 ? (totalNilaiSemuaSiswa / students.length).toFixed(2) : "0.00";

  const lastThreeLogs = [...logs]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 3);

  const filteredTop = levelTop ? students.filter((s) => s.level === levelTop) : students;
  const filteredBottom = levelBottom ? students.filter((s) => s.level === levelBottom) : students;

  const topThree = filteredTop
    .map((s) => ({
      ...s,
      rata: (Number(s.nilaiMateri1 || 0) + Number(s.nilaiMateri2 || 0) + Number(s.nilaiMateri3 || 0)) / 3,
    }))
    .sort((a, b) => b.rata - a.rata)
    .slice(0, 3);

  const bottomThree = filteredBottom
    .map((s) => ({
      ...s,
      rata: (Number(s.nilaiMateri1 || 0) + Number(s.nilaiMateri2 || 0) + Number(s.nilaiMateri3 || 0)) / 3,
    }))
    .sort((a, b) => a.rata - b.rata)
    .slice(0, 3);

  const graphicData = students.slice(0, 15).map((s) => ({
    name: s.name,
    nilaiMateri1: s.nilaiMateri1,
    nilaiMateri2: s.nilaiMateri2,
    nilaiMateri3: s.nilaiMateri3,
  }));

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const logsThisMonth = logs.filter((log) => {
    const d = new Date(log.tanggal);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalAbsen = logsThisMonth.reduce((total, log) => {
    if (log.tidakHadir?.trim()) {
      return total + log.tidakHadir.split(",").length;
    }
    return total;
  }, 0);

  return {
    logCount: logs.length,
    studentCount: students.length,
    averageNilai,
    totalAbsen,
    lastLog: lastThreeLogs,
    rankStudents: topThree,
    bottomThreeRankStudents: bottomThree,
    graphicNilai: graphicData,
  };
};

const Dashboard = () => {
  const navigate = useNavigate(); // Hook untuk navigasi React Router
  const [stats, setStats] = useState({
    logCount: 0,
    studentCount: 0,
    averageNilai: 0,
    totalAbsen: 0,
    lastLog: [],
    rankStudents: [],
    bottomThreeRankStudents: [],
    graphicNilai: [],
  });

  const [selectedLevelTop, setSelectedLevelTop] = useState("");
  const [selectedLevelBottom, setSelectedLevelBottom] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      const data = await getStats(selectedLevelTop, selectedLevelBottom);
      if (data) setStats(data);
    };
    loadDashboardData();
  }, [selectedLevelTop, selectedLevelBottom]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans">
      
      {/* HEADER DASHBOARD */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan aktivitas dan data akademik siswa.</p>
        </div>
      </div>

      {/* ROW 1: 4 KARTU STATISTIK UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
          <div className="bg-blue-50 p-4 rounded-full">
            <HiOutlineDocumentText className="text-blue-600 text-3xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold text-gray-800">{stats.logCount}</p>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
          <div className="bg-blue-50 p-4 rounded-full">
            <HiOutlineUsers className="text-blue-600 text-3xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Siswa</p>
            <p className="text-2xl font-bold text-gray-800">{stats.studentCount}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
          <div className="bg-blue-50 p-4 rounded-full">
            <HiOutlineChartBar className="text-blue-600 text-3xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rata-rata Nilai</p>
            <p className="text-2xl font-bold text-gray-800">{stats.averageNilai}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
          <div className="bg-red-50 p-4 rounded-full">
            <HiOutlineCalendarDays className="text-red-500 text-3xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Absen Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalAbsen}</p>
          </div>
        </div>
      </div>

      {/* ROW 2: GRAFIK (KIRI) & LOG TERAKHIR (KANAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* GRAFIK (Ambil 2 Kolom) */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <HiOutlineChartBar className="text-blue-600" />
            Grafik Nilai Siswa
          </h2>
          <div className="flex items-end h-64 border-b-2 border-l-2 border-gray-100 px-4 pb-2 gap-6 overflow-x-auto pt-4">
            {stats?.graphicNilai?.slice(0, 15).map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full group">
                {/* Container Batang */}
                <div className="flex items-end gap-1.5 h-full pt-4">
                  <div className="w-4 sm:w-6 bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-400 relative" style={{ height: `${Number(item.nilaiMateri1) || 0}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{item.nilaiMateri1 || 0}</span>
                  </div>
                  <div className="w-4 sm:w-6 bg-indigo-400 rounded-t-md transition-all group-hover:bg-indigo-300 relative" style={{ height: `${Number(item.nilaiMateri2) || 0}%` }}>
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{item.nilaiMateri2 || 0}</span>
                  </div>
                  <div className="w-4 sm:w-6 bg-sky-300 rounded-t-md transition-all group-hover:bg-sky-200 relative" style={{ height: `${Number(item.nilaiMateri3) || 0}%` }}>
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{item.nilaiMateri3 || 0}</span>
                  </div>
                </div>
                {/* Label Nama */}
                <p className="text-xs mt-3 truncate w-16 text-center text-gray-500 font-medium">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
          {/* Legenda Grafik */}
          <div className="flex gap-4 mt-6 justify-center text-sm text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Materi 1</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-400"></div> Materi 2</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-sky-300"></div> Materi 3</div>
          </div>
        </div>

        {/* LOG TERAKHIR (Ambil 1 Kolom) */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <HiOutlineDocumentText className="text-blue-600" />
            Log Terbaru
          </h2>
          {stats.lastLog && stats.lastLog.length > 0 ? (
            <div className="space-y-5">
              {stats.lastLog.map((log, index) => (
                <div key={index} className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition border border-gray-100">
                  <div className="bg-white p-2 rounded-full shadow-sm text-blue-600 mt-1">
                    <HiOutlineDocumentText />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Kelas {log.kelas}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{log.materi}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                      {new Date(log.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Belum ada log tercatat.
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: TOP 3, BOTTOM 3, & QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TIGA TERATAS */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <HiOutlineTrophy className="text-yellow-500 text-xl" />
              Top 3 Siswa
            </h2>
            <select
              className="bg-gray-50 border-none text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              onChange={(e) => setSelectedLevelTop(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {stats.rankStudents?.length > 0 ? (
              stats.rankStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                      {index + 1}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{student.name}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">{student.rata.toFixed(1)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Data tidak tersedia</p>
            )}
          </div>
        </div>

        {/* TIGA TERBAWAH */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <HiOutlineArrowTrendingDown className="text-red-500 text-xl" />
              Perlu Perhatian
            </h2>
            <select
              className="bg-gray-50 border-none text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-red-100 outline-none cursor-pointer"
              onChange={(e) => setSelectedLevelBottom(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {stats.bottomThreeRankStudents?.length > 0 ? (
              stats.bottomThreeRankStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-sm text-red-500">
                      !
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{student.name}</p>
                  </div>
                  <p className="text-sm font-bold text-red-500">{student.rata.toFixed(1)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Data tidak tersedia</p>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-blue-600 p-8 rounded-[32px] shadow-lg shadow-blue-200 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Aksi Cepat</h2>
            <p className="text-blue-100 text-sm mb-6">Kelola data akademik atau tambahkan aktivitas hari ini.</p>
          </div>
          <div className="flex flex-col gap-3">
            {/* Menggunakan useNavigate dari React Router agar transisi mulus (tanpa refresh) */}
            <button
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-6 rounded-full transition-transform active:scale-95 shadow-md w-full flex justify-center items-center gap-2"
              onClick={() => navigate("/logs")}
            >
              <HiOutlineDocumentText className="text-xl"/>
              Catat Log Baru
            </button>
            <button
              className="bg-blue-700 hover:bg-blue-800 border border-blue-500 text-white font-bold py-4 px-6 rounded-full transition-transform active:scale-95 w-full flex justify-center items-center gap-2"
              onClick={() => navigate("/student")}
            >
              <HiOutlineUsers className="text-xl"/>
              Kelola Siswa
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;