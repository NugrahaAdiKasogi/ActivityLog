import { useState, useEffect } from "react";

const getStats = (levelTop, levelBottom) => {
  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  const students = JSON.parse(localStorage.getItem("students") || "[]");

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

  const ThreelastLogs = logs.slice(0, 3).sort((a, b) => b.tanggal - a.tanggal); // Ambil 3 log terakhir dan balik urutannya

  //Top 3 siswa berdasarkan jenjang
  const filteredStudentsTop = levelTop
    ? students.filter((s) => s.level === levelTop)
    : students;

  const filteredStudentsBottom = levelBottom
    ? students.filter((s) => s.level === levelBottom)
    : students;

  const topThreeRankStudents = filteredStudentsTop
    .map((s) => ({
      ...s,
      rata:
        (Number(s.nilaiMateri1 || 0) +
          Number(s.nilaiMateri2 || 0) +
          Number(s.nilaiMateri3 || 0)) /
        3,
    }))
    .sort((a, b) => b.rata - a.rata) // Urutkan berdasarkan rata-rata nilai
    .slice(0, 3); // Ambil hanya 3 siswa teratas

  const bottomThreeRankStudents = filteredStudentsBottom
    .map((s) => ({
      ...s,
      rata:
        (Number(s.nilaiMateri1 || 0) +
          Number(s.nilaiMateri2 || 0) +
          Number(s.nilaiMateri3 || 0)) /
        3,
    }))
    .sort((a, b) => a.rata - b.rata) // Urutkan berdasarkan rata-rata nilai
    .slice(0, 3); // Ambil hanya 3 siswa terbawah

  const graphicNilai = students.map((s) => ({
    name: s.name,
    nilaiMateri1: Number(s.nilaiMateri1 || 0),
    nilaiMateri2: Number(s.nilaiMateri2 || 0),
    nilaiMateri3: Number(s.nilaiMateri3 || 0),
  }));

  // Logika Filter Tanggal:
  // Dapatkan bulan dan tahun saat ini menggunakan new Date().getMonth() dan getFullYear().
  // Filter logs yang memiliki tanggal di bulan dan tahun yang sama.
  // Lakukan penghitungan absen hanya pada hasil filter tersebut.

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const logsThisMonth = logs.filter((log) => {
    const logDate = new Date(log.tanggal);
    return (
      logDate.getMonth() === currentMonth &&
      logDate.getFullYear() === currentYear
    );
  });

  const totalAbsen = logsThisMonth.reduce((total, log) => {
    if (log.tidakHadir && log.tidakHadir.trim() !== "") {
      // Membagi string berdasarkan koma dan menghitung jumlahnya
      const jumlahOrang = log.tidakHadir.split(",").length;
      return total + jumlahOrang;
    }
    return total;
  }, 0);

  return {
    logCount: logs.length,
    studentCount: students.length,
    averageNilai: averageNilai,
    totalAbsen: totalAbsen,
    lastLog: ThreelastLogs,
    rankStudents: topThreeRankStudents,
    bottomThreeRankStudents: bottomThreeRankStudents,
    graphicNilai: graphicNilai,
  };
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    logCount: 0,
    studentCount: 0,
    averageNilai: 0,
    lastLog: null,
    rankStudents: null,
    bottomThreeRankStudents: null,
    graphicNilai: null,
  });

  const [selectedLevelTop, setSelectedLevelTop] = useState("");
  const [selectedLevelBottom, setSelectedLevelBottom] = useState("");

  useEffect(() => {
    const data = getStats(selectedLevelTop, selectedLevelBottom);
    setStats(data);
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
          <p className="text-5xl font-bold text-center mt-4">{stats.totalAbsen}</p>
        </div>

        {/* Graph */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Grafik Nilai</h2>
          <div className="mt-4">
            {/* Implementasi grafik bisa menggunakan library seperti Chart.js atau Recharts */}
            {/* Contoh placeholder untuk grafik */}
            {stats.graphicNilai && stats.graphicNilai.length > 0 ? (
              <div className="h-20 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Grafik akan ditampilkan di sini</p>
              </div>
            ) : (
              <p className="text-gray-500">No data available for graph.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => (window.location.href = "/add-log")}
            >
              Tambah Log
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => (window.location.href = "/add-student")}
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
