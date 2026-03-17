import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const getStats = async (levelTop, levelBottom) => {
  // 1. Ambil data dari Supabase
  const { data: logs, error: logError } = await supabase
    .from("logs")
    .select("*");
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("*");

  if (logError || studentError) {
    console.error("Error fetching dashboard data:", logError || studentError);
    return null;
  }

  // --- LOGIKA PERHITUNGAN (Sama seperti sebelumnya, tapi pakai data dari DB) ---

  const totalNilaiSemuaSiswa = students.reduce((sum, s) => {
    const rataSiswa =
      (Number(s.nilaiMateri1 || 0) +
        Number(s.nilaiMateri2 || 0) +
        Number(s.nilaiMateri3 || 0)) /
      3;
    return sum + rataSiswa;
  }, 0);

  const averageNilai =
    students.length > 0
      ? (totalNilaiSemuaSiswa / students.length).toFixed(2)
      : "0.00";

  // Ambil 3 log terbaru (Sort berdasarkan tanggal di database biasanya lebih aman)
  const lastThreeLogs = [...logs]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 3);

  // Filter Top & Bottom
  const filteredTop = levelTop
    ? students.filter((s) => s.level === levelTop)
    : students;
  const filteredBottom = levelBottom
    ? students.filter((s) => s.level === levelBottom)
    : students;

  const topThree = filteredTop
    .map((s) => ({
      ...s,
      rata:
        (Number(s.nilaiMateri1 || 0) +
          Number(s.nilaiMateri2 || 0) +
          Number(s.nilaiMateri3 || 0)) /
        3,
    }))
    .sort((a, b) => b.rata - a.rata)
    .slice(0, 3);

  const bottomThree = filteredBottom
    .map((s) => ({
      ...s,
      rata:
        (Number(s.nilaiMateri1 || 0) +
          Number(s.nilaiMateri2 || 0) +
          Number(s.nilaiMateri3 || 0)) /
        3,
    }))
    .sort((a, b) => a.rata - b.rata)
    .slice(0, 3);

  // Grafik Nilai (Ambil 15 siswa saja agar tidak terlalu penuh)
  const graphicData = students.slice(0, 15).map((s) => ({
    name: s.name,
    nilaiMateri1: s.nilaiMateri1,
    nilaiMateri2: s.nilaiMateri2,
    nilaiMateri3: s.nilaiMateri3,
  }));

  // Hitung Absen Bulan Ini
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
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Data Terkini</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Logs */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Logs</h2>
          <p className="text-3xl font-bold">{stats.logCount}</p>
        </div>

        {/* Total Siswa */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Siswa</h2>
          <p className="text-3xl font-bold">{stats.studentCount}</p>
        </div>

        {/* Rata-rata Nilai */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Rata-rata Nilai</h2>
          <p className="text-3xl font-bold">{stats.averageNilai}</p>
        </div>

        {/* Log Terakhir */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Log Terakhir</h2>
          {stats.lastLog ? (
            <div className="mt-4">
              {/* Display last logs here */}
              {/* Mapping */}
              {stats.lastLog.map((log, index) => (
                <div key={index} className="mb-4 p-2 border-t">
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {new Date(log.tanggal).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Kelas:</strong> {log.kelas}
                  </p>
                  <p>
                    <strong>Materi:</strong> {log.materi}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No logs available.</p>
          )}
        </div>

        {/* Tiga Teratas Siswa */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Tiga Teratas Siswa</h2>
          {stats.rankStudents ? (
            <div className="mt-4">
              {stats.rankStudents.map((student, index) => (
                <div key={index} className="mb-2 p-2 border-t">
                  <p>
                    <strong>Nama:</strong> {student.name}
                  </p>
                  <p>
                    <strong>Rata-rata:</strong> {student.rata.toFixed(2)}
                  </p>
                </div>
              ))}
              {/* Dropdown Filter */}
              <div className="mt-4">
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 border-t pt-4"
                >
                  Filter Jenjang
                </label>
                <select
                  id="level"
                  name="level"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e) => {
                    setSelectedLevelTop(e.target.value);
                  }}
                >
                  <option value="">Semua Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
            </div>
          ) : (
            <p>No students available.</p>
          )}
        </div>

        {/* Tiga Terbawah Siswa */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Tiga Terbawah Siswa</h2>
          {stats.bottomThreeRankStudents ? (
            <div className="mt-4">
              {stats.bottomThreeRankStudents.map((student, index) => (
                <div key={index} className="mb-2 p-2 border-t">
                  <p>
                    <strong>Nama:</strong> {student.name}
                  </p>
                  <p>
                    <strong>Rata-rata:</strong> {student.rata.toFixed(2)}
                  </p>
                </div>
              ))}
              {/* Dropdown Filter */}
              <div className="mt-4">
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 border-t pt-4"
                >
                  Filter Jenjang
                </label>
                <select
                  id="level"
                  name="level"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e) => {
                    setSelectedLevelBottom(e.target.value);
                  }}
                >
                  <option value="">Semua Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
            </div>
          ) : (
            <p>No students available.</p>
          )}
        </div>

        {/* Jumlah Absen Bulan Ini */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Jumlah Absen Bulan Ini</h2>
          <p className="text-5xl font-bold text-center mt-4">
            {stats.totalAbsen}
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            {`Total absen dari ${stats.logCount || 0} log yang tercatat di bulan ini`}
          </p>
        </div>

        <div className="flex items-end h-64 border-l border-b border-gray-300 px-2 pb-1 gap-4 overflow-x-auto">
          {//grafik dibatasi 15 siswa agar tidak terlalu penuh, dan pakai data dari DB
          stats?.graphicNilai?.slice(0, 15).map((item, index) => (
            <div key={index} className="flex flex-col items-center h-full">
              {/* Container Batang */}
              <div className="flex items-end gap-1 flex-1">
                <div
                  className="w-5 bg-blue-500 rounded-t-sm"
                  style={{ height: `${Number(item.nilaiMateri1) || 0}%` }}
                  title={`Nilai Materi 1: ${item.nilaiMateri1 || 0}`}
                ></div>
                <div
                  className="w-5 bg-green-500 rounded-t-sm"
                  style={{ height: `${Number(item.nilaiMateri2) || 0}%` }}
                  title={`Nilai Materi 2: ${item.nilaiMateri2 || 0}`}
                ></div>
                <div
                  className="w-5 bg-red-500 rounded-t-sm"
                  style={{ height: `${Number(item.nilaiMateri3) || 0}%` }}
                  title={`Nilai Materi 3: ${item.nilaiMateri3 || 0}`}
                ></div>
              </div>

              {/* Label Nama */}
              <p className="text-[10px] mt-2 truncate w-16 text-center">
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => (window.location.href = "/logs")}
            >
              Tambah Log
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => (window.location.href = "/student")}
            >
              Tambah Siswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
