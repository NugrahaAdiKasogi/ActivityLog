import { useEffect, useReducer, useState } from "react";
import Modals from "../components/layout/Modals";
import { supabase } from "../lib/supabase";

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
      return [
        ...state,
        {
          id: Date.now(),
          ...action.payload,
        },
      ];
    case "DELETE":
      return state.filter((item) => item.id !== action.payload);
    case "EDIT":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.data }
          : item,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

    // Validasi (Pastikan semua field terisi)
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
      // --- PROSES EDIT ---
      const { error } = await supabase
        .from("students")
        .update(studentData)
        .eq("id", editingId);

      if (!error) {
        dispatch({
          type: "EDIT",
          payload: { id: editingId, data: studentData },
        });
      } else {
        console.error("Gagal Update:", error.message);
      }
    } else {
      // --- PROSES TAMBAH ---
      const { data, error } = await supabase
        .from("students")
        .insert([studentData])
        .select();

      if (!error && data) {
        dispatch({ type: "ADD", payload: data[0] });
        setFormInput(emptyForm);
      } else {
        console.error("Gagal Simpan:", error.message);
      }
    }

    handleCloseModal(); // Menutup modal setelah sukses atau gagal (agar tidak nyangkut)
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

  const processedStudents = dataStudents
    .map((student) => {
      const nilaiAkhir =
        (Number(student.nilaiMateri1) +
          Number(student.nilaiMateri2) +
          Number(student.nilaiMateri3)) /
          3 || 0;

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

  // Setelah pipeline selesai, baru kamu cari nilai tertinggi sekelas
  // untuk keperluan highlight (warna kuning)
  const kumpulanNilai = processedStudents.map((s) => s.nilaiAkhir);
  const highestScore =
    kumpulanNilai.length > 0 ? Math.max(...kumpulanNilai, 0) : 0;

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = processedStudents.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(processedStudents.length / itemsPerPage),
  );
  //kalau data nya 0, totalPages nya 0, nah kalau totalPages nya 0, maka currentPage nya juga harus 0, biar gak error pas klik next/previous
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(0);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedKelas]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-xl mx-auto mt-8  p-8">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Data Siswa
            </h1>

            {/* Button Open Modals */}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition duration-200"
              onClick={() => addStudent()}
            >
              + Tambah Siswa
            </button>
          </div>

          <div className="flex justify-between">
            {/* Search bar */}
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[50%] py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="ml-4 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Semua Jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>

            {/* Kelas Filter */}
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="ml-4 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Semua Kelas</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-4 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="name">Sort by Name</option>
              <option value="level">Sort by Level</option>
              <option value="kelas">Sort by Class</option>
              <option value="nilaiAkhir">Sort by Final Score</option>
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSelectedLevel("");
                setSelectedKelas("");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-600 active:scale-95 transition duration-200"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {isModalOpen && (
          <Modals
            onClose={handleCloseModal}
            title={editingId ? "Edit Siswa" : "Tambah Siswa"}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Nama */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Masukkan Nama
                </label>
                <input
                  type="text"
                  value={formInput.name}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      name: e.target.value,
                    })
                  }
                  placeholder="Contoh: Budi"
                  className="px-4 py-2 border  border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Select Jenjang */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Pilih Jenjang
                </label>
                <select
                  value={formInput.level}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      level: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Pilih --</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              {/* Input Kelas */}
              <div className="flex flex-col ">
                <label className="mb-2 font-medium text-gray-700">Kelas</label>
                <input
                  type="text"
                  value={formInput.kelas}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      kelas: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              {/* Input Nilai */}
              <div className="flex justify-between items-center">
                <label className="mb-2 font-medium text-gray-700">
                  Nilai 1:
                </label>
                <input
                  className="border rounded-sm text-center"
                  type="number"
                  value={formInput.nilaiMateri1}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      nilaiMateri1: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="mb-2 font-medium text-gray-700">
                  Nilai 2:
                </label>
                <input
                  className="border rounded-sm text-center"
                  type="number"
                  value={formInput.nilaiMateri2}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      nilaiMateri2: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="mb-2 font-medium text-gray-700">
                  Nilai 3:
                </label>
                <input
                  className="border rounded-sm text-center"
                  type="number"
                  value={formInput.nilaiMateri3}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      nilaiMateri3: e.target.value,
                    })
                  }
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition duration-200"
              >
                SUBMIT
              </button>
            </form>
          </Modals>
        )}

        {/* Table */}

        <table className="w-full mt-8 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Jenjang</th>
              <th className="px-4 py-2">Kelas</th>
              <th className="px-4 py-2">Materi 1</th>
              <th className="px-4 py-2">Materi 2</th>
              <th className="px-4 py-2">Materi 3</th>
              <th className="px-4 py-2">Nilai Akhir</th>
              <th className="px-4 py-2" colSpan={2}>
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-400">
                  Belum ada data
                </td>
              </tr>
            ) : (
              currentData.map((student) => {
                return (
                  <tr
                    key={student.id}
                    className={
                      student.nilaiAkhir === highestScore && highestScore > 0
                        ? "bg-yellow-200"
                        : "hover:bg-gray-100 even:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.level}</td>
                    <td>{student.kelas}</td>
                    <td>{student.nilaiMateri1}</td>
                    <td>{student.nilaiMateri2}</td>
                    <td>{student.nilaiMateri3}</td>
                    <td>{student.nilaiAkhir.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg "
                      >
                        Hapus
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="bg-blue-600 text-white px-4 py-1 rounded-lg "
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <span className="font-medium text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Student;
