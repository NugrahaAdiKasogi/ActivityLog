import { useEffect, useReducer, useState } from "react";
import Modals from "../components/layout/Modals";
import { supabase } from "../lib/supabase";
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineArrowPath
} from "react-icons/hi2";

import { HiOutlineSearch } from "react-icons/hi";

const init = () => {
  try {
    const stored = localStorage.getItem("students");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load students", error);
    return [];
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return [...state, { id: Date.now(), ...action.payload }];
    case "DELETE":
      return state.filter((item) => item.id !== action.payload);
    case "EDIT":
      return state.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload.data } : item
      );
    case "SET_INITIAL_DATA":
      return action.payload;
    default:
      return state;
  }
};

const Student = () => {
  const [dataStudents, dispatch] = useReducer(reducer, [], init);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // States untuk Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Disesuaikan agar tabel tidak terlalu panjang ke bawah

  const emptyForm = {
    name: "",
    level: "",
    kelas: "",
    nilaiMateri1: "",
    nilaiMateri2: "",
    nilaiMateri3: "",
  };

  const [formInput, setFormInput] = useState(emptyForm);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (!error) dispatch({ type: "SET_INITIAL_DATA", payload: data });
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formInput.name ||
      !formInput.level ||
      !formInput.kelas ||
      !formInput.nilaiMateri1 ||
      !formInput.nilaiMateri2 ||
      !formInput.nilaiMateri3
    ) {
      alert("Harap isi semua bidang.");
      return;
    }

    const studentData = {
      name: formInput.name,
      level: formInput.level,
      kelas: formInput.kelas,
      nilaiMateri1: Number(formInput.nilaiMateri1),
      nilaiMateri2: Number(formInput.nilaiMateri2),
      nilaiMateri3: Number(formInput.nilaiMateri3),
    };

    if (editingId) {
      const { error } = await supabase.from("students").update(studentData).eq("id", editingId);
      if (!error) {
        dispatch({ type: "EDIT", payload: { id: editingId, data: studentData } });
      } else {
        console.error("Gagal Update:", error.message);
      }
    } else {
      const { data, error } = await supabase.from("students").insert([studentData]).select();
      if (!error && data) {
        dispatch({ type: "ADD", payload: data[0] });
        setFormInput(emptyForm);
      } else {
        console.error("Gagal Simpan:", error.message);
      }
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (!error) {
        dispatch({ type: "DELETE", payload: id });
      } else {
        alert("Gagal menghapus data dari server.");
      }
    }
  };

  const handleEdit = (student) => {
    setFormInput({
      name: student.name,
      level: student.level,
      kelas: student.kelas,
      nilaiMateri1: student.nilaiMateri1,
      nilaiMateri2: student.nilaiMateri2,
      nilaiMateri3: student.nilaiMateri3,
    });
    setEditingId(student.id);
    setisModalOpen(true);
  };

  const addStudent = () => {
    setEditingId(null);
    setFormInput(emptyForm);
    setisModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingId(null);
    setFormInput(emptyForm);
    setisModalOpen(false);
  };

  // --- DATA PIPELINE ---
  const processedStudents = dataStudents
    .map((student) => {
      const nilaiAkhir =
        (Number(student.nilaiMateri1) + Number(student.nilaiMateri2) + Number(student.nilaiMateri3)) / 3 || 0;
      return { ...student, nilaiAkhir };
    })
    .filter((student) => {
      if (selectedLevel && student.level !== selectedLevel) return false;
      if (selectedKelas && student.kelas !== selectedKelas) return false;

      const search = searchTerm.toLowerCase();
      const nameMatch = student.name.toLowerCase().includes(search);
      const levelMatch = student.level.toLowerCase().includes(search);
      const kelasMatch = student.kelas.toLowerCase().includes(search);

      return nameMatch || levelMatch || kelasMatch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "level") return a.level.localeCompare(b.level);
      if (sortBy === "kelas") return a.kelas.localeCompare(b.kelas);
      if (sortBy === "nilaiAkhir") return b.nilaiAkhir - a.nilaiAkhir;
      return 0;
    });

  const kumpulanNilai = processedStudents.map((s) => s.nilaiAkhir);
  const highestScore = kumpulanNilai.length > 0 ? Math.max(...kumpulanNilai, 0) : 0;

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = processedStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(processedStudents.length / itemsPerPage));

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(0);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedKelas, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
              <HiOutlineUsers className="text-blue-600" />
              Data Siswa
            </h1>
            <p className="text-gray-500 mt-1">Kelola data akademik dan nilai siswa secara keseluruhan.</p>
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 active:scale-95 transition duration-200 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 shrink-0"
            onClick={addStudent}
          >
            <HiOutlinePlus className="text-xl" />
            Tambah Siswa
          </button>
        </div>

        {/* CONTROLS & FILTERS SECTION */}
        <div className="bg-white p-4 lg:p-6 rounded-[32px] shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, jenjang, kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
          </div>

          {/* Select Filters Group */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-gray-50 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition text-sm text-gray-600 cursor-pointer flex-1 lg:flex-none"
            >
              <option value="">Semua Jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>

            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-gray-50 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition text-sm text-gray-600 cursor-pointer flex-1 lg:flex-none"
            >
              <option value="">Semua Kelas</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Kelas {i + 1}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition text-sm text-gray-600 cursor-pointer flex-1 lg:flex-none"
            >
              <option value="">Urutkan (Default)</option>
              <option value="name">Nama (A-Z)</option>
              <option value="level">Jenjang</option>
              <option value="kelas">Kelas</option>
              <option value="nilaiAkhir">Nilai Tertinggi</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSelectedLevel("");
                setSelectedKelas("");
                setSearchTerm("");
                setSortBy("");
              }}
              className="p-3 text-gray-400 bg-gray-50 border border-gray-200 rounded-full hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition"
              title="Reset Filter"
            >
              <HiOutlineArrowPath className="text-xl" />
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                  <th className="px-6 py-4 font-semibold">Jenjang</th>
                  <th className="px-6 py-4 font-semibold text-center">Kelas</th>
                  <th className="px-6 py-4 font-semibold text-center">Materi 1</th>
                  <th className="px-6 py-4 font-semibold text-center">Materi 2</th>
                  <th className="px-6 py-4 font-semibold text-center">Materi 3</th>
                  <th className="px-6 py-4 font-semibold text-center text-blue-600">Nilai Akhir</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <HiOutlineUsers className="text-5xl mb-3 opacity-20" />
                        <p>Tidak ada data siswa yang cocok.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map((student) => {
                    const isHighest = student.nilaiAkhir === highestScore && highestScore > 0;
                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors duration-200 ${
                          isHighest ? "bg-amber-50/60 hover:bg-amber-100/60" : "hover:bg-blue-50/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Inisial Nama sebagai Avatar Kosong */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isHighest ? 'bg-amber-200 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-semibold ${isHighest ? 'text-amber-900' : 'text-gray-800'}`}>
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.level}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">{student.kelas}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{student.nilaiMateri1}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{student.nilaiMateri2}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{student.nilaiMateri3}</td>
                        <td className="px-6 py-4 text-sm font-bold text-center">
                           <span className={isHighest ? "text-amber-600" : "text-blue-600"}>
                             {student.nilaiAkhir.toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                              title="Edit"
                            >
                              <HiOutlinePencilSquare className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                              title="Hapus"
                            >
                              <HiOutlineTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                Halaman <span className="text-gray-800">{currentPage}</span> dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <Modals onClose={handleCloseModal} title={editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Susanto"
                  value={formInput.name}
                  onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jenjang</label>
                  <select
                    value={formInput.level}
                    onChange={(e) => setFormInput({ ...formInput, level: e.target.value })}
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Pilih --</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas</label>
                  <select
                    value={formInput.kelas}
                    onChange={(e) => setFormInput({ ...formInput, kelas: e.target.value })}
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Pilih --</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <p className="text-sm font-bold text-blue-800 mb-4">Input Nilai Evaluasi</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 text-center">Materi 1</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={formInput.nilaiMateri1}
                      onChange={(e) => setFormInput({ ...formInput, nilaiMateri1: e.target.value })}
                      className="w-full px-3 py-2 border border-white rounded-xl bg-white shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 text-center">Materi 2</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={formInput.nilaiMateri2}
                      onChange={(e) => setFormInput({ ...formInput, nilaiMateri2: e.target.value })}
                      className="w-full px-3 py-2 border border-white rounded-xl bg-white shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 text-center">Materi 3</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={formInput.nilaiMateri3}
                      onChange={(e) => setFormInput({ ...formInput, nilaiMateri3: e.target.value })}
                      className="w-full px-3 py-2 border border-white rounded-xl bg-white shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                      required
                    />
                  </div>
                </div>
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
                  {editingId ? "Simpan Perubahan" : "Simpan Siswa"}
                </button>
              </div>
            </form>
          </Modals>
        )}
      </div>
    </div>
  );
};

export default Student;