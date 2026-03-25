import { useEffect, useReducer, useState } from "react";
import Modals from "../components/layout/Modals";
import { supabase } from "../lib/supabase";
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlineBookOpen, 
  HiOutlineUsers, 
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineCalendarDays
} from "react-icons/hi2";

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_LOG":
      return [...state, action.payload];
    case "DELETE_LOG":
      return state.filter((log) => log.id !== action.payload);
    case "EDIT_LOG":
      return state.map((log) =>
        log.id === action.payload.id ? { ...log, ...action.payload } : log
      );
    case "SET_LOGS":
      return action.payload;
    default:
      return state;
  }
};

const emptyLogs = {
  tanggal: "",
  kelas: "",
  materi: "",
  tidakHadir: "",
  catatan: "",
};

const Logs = () => {
  const [logs, dispatch] = useReducer(reducer, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logForm, setLogForm] = useState(emptyLogs);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase.from("logs").select("*");
      if (!error) {
        dispatch({ type: "SET_LOGS", payload: data });
      }
    };
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.tanggal || !logForm.kelas || !logForm.materi) {
      alert("Harap isi semua bidang wajib.");
      return;
    }

    const logData = {
      tanggal: logForm.tanggal,
      kelas: logForm.kelas,
      materi: logForm.materi,
      tidakHadir: logForm.tidakHadir,
      catatan: logForm.catatan,
    };

    if (editingId) {
      const { error } = await supabase
        .from("logs")
        .update(logData)
        .eq("id", editingId);

      if (!error) {
        dispatch({ type: "EDIT_LOG", payload: { ...logData, id: editingId } });
        handleCloseModal();
      } else {
        console.error("Error update:", error);
        alert("Gagal update log: " + error.message);
      }
    } else {
      const { data, error } = await supabase.from("logs").insert([logData]).select();
      if (!error && data) {
        dispatch({ type: "ADD_LOG", payload: data[0] });
        setLogForm(emptyLogs);
        handleCloseModal();
      } else {
        alert("Gagal menambah log ke server.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setLogForm(emptyLogs);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus log ini?")) {
      const { error } = await supabase.from("logs").delete().eq("id", id);
      if (!error) {
        dispatch({ type: "DELETE_LOG", payload: id });
      } else {
        alert("Failed to delete log from server.");
      }
    }
  };

  const handleEdit = (log) => {
    setLogForm(log);
    setEditingId(log.id);
    setIsModalOpen(true);
  };

  const addLogs = () => {
    setLogForm(emptyLogs);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const processLogs = logs
    .map((log) => ({
      ...log,
      tanggalTime: new Date(log.tanggal).getTime(),
    }))
    .sort((a, b) => b.tanggalTime - a.tanggalTime);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Activity Logs</h1>
            <p className="text-gray-500 mt-1">Catatan harian aktivitas mengajar dan absensi.</p>
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 active:scale-95 transition duration-200 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            onClick={addLogs}
          >
            <HiOutlinePlus className="text-xl" />
            Tambah Log
          </button>
        </div>

        {/* TIMELINE SECTION */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <HiOutlineBookOpen className="text-6xl mx-auto mb-4 opacity-50" />
              <p>Belum ada log aktivitas yang tercatat.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-blue-100 ml-4 md:ml-32">
              {processLogs.map((log) => (
                <div className="mb-12 ml-6 md:ml-10 relative group" key={log.id}>
                  
                  {/* Tanggal (Tampil di Kiri pada Desktop) */}
                  <div className="hidden md:block absolute -left-48 top-1 text-right w-32">
                    <p className="text-sm font-bold text-gray-700">
                      {new Date(log.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.tanggal).getFullYear()}
                    </p>
                  </div>

                  {/* Titik Simpul Timeline */}
                  <div className="absolute -left-[33px] md:-left-[49px] top-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-sm group-hover:scale-125 transition-transform"></div>

                  {/* Card Konten Log */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {/* Tanggal Mobile */}
                        <div className="md:hidden flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full">
                          <HiOutlineCalendarDays />
                          {new Date(log.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        <h3 className="font-extrabold text-xl text-gray-800">
                          Kelas {log.kelas}
                        </h3>
                      </div>

                      {/* Tombol Aksi (Outline Icons) */}
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                          onClick={() => handleEdit(log)}
                          title="Edit Log"
                        >
                          <HiOutlinePencilSquare className="text-xl" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                          onClick={() => handleDelete(log.id)}
                          title="Hapus Log"
                        >
                          <HiOutlineTrash className="text-xl" />
                        </button>
                      </div>
                    </div>

                    {/* Detail Log */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-gray-600">
                        <HiOutlineBookOpen className="text-xl text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed"><span className="font-semibold text-gray-700">Materi:</span> {log.materi}</p>
                      </div>
                      
                      {log.catatan && (
                        <div className="flex items-start gap-3 text-gray-600">
                          <HiOutlineChatBubbleLeftEllipsis className="text-xl text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed"><span className="font-semibold text-gray-700">Catatan:</span> {log.catatan}</p>
                        </div>
                      )}

                      {log.tidakHadir && (
                        <div className="flex items-start gap-3 text-red-500 bg-red-50 p-3 rounded-2xl border border-red-100 mt-4">
                          <HiOutlineUsers className="text-xl shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed font-medium">
                            Tidak Hadir: {log.tidakHadir}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <Modals onClose={handleCloseModal} title={editingId ? "Edit Log Aktivitas" : "Tambah Log Baru"}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={logForm.tanggal}
                  onChange={(e) => setLogForm({ ...logForm, tanggal: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: 10 IPA 1"
                  value={logForm.kelas}
                  onChange={(e) => setLogForm({ ...logForm, kelas: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Materi Pembelajaran</label>
                <input
                  type="text"
                  placeholder="Materi yang diajarkan hari ini"
                  value={logForm.materi}
                  onChange={(e) => setLogForm({ ...logForm, materi: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Siswa Tidak Hadir (Opsional)</label>
                <textarea
                  placeholder="Pisahkan dengan koma (contoh: Budi, Andi)"
                  value={logForm.tidakHadir}
                  onChange={(e) => setLogForm({ ...logForm, tidakHadir: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  placeholder="Catatan perkembangan kelas, PR, dll."
                  value={logForm.catatan}
                  onChange={(e) => setLogForm({ ...logForm, catatan: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="px-6 py-3 font-semibold text-gray-500 hover:bg-gray-100 rounded-full transition"
                  onClick={handleCloseModal}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-200"
                >
                  Simpan Log
                </button>
              </div>
            </form>
          </Modals>
        )}
      </div>
    </div>
  );
};

export default Logs;