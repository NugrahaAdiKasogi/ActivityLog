import { useEffect, useReducer, useState } from 'react';
import Modals from '../components/layout/Modals';

const init = () => {
  try {
    const stored = localStorage.getItem('students');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load students', error);
    return [];
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [
        ...state,
        {
          id: Date.now(),
          ...action.payload,
        },
      ];
    case 'DELETE':
      return state.filter((item) => item.id !== action.payload);
    case 'EDIT':
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.data }
          : item
      );
    default:
      return state;
  }
};

const Student = () => {
  const [dataStudents, dispatch] = useReducer(reducer, [], init);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const emptyForm = {
    name: '',
    level: '',
    kelas: '',
    nilaiMateri1: '',
    nilaiMateri2: '',
    nilaiMateri3: '',
  };

  const [formInput, setFormInput] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(dataStudents));
  }, [dataStudents]);

  const filteredStudents = dataStudents.filter((student) => {
    const name = student.name.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formInput.name ||
      !formInput.level ||
      !formInput.kelas ||
      !formInput.nilaiMateri1 ||
      !formInput.nilaiMateri2 ||
      !formInput.nilaiMateri3
    )
      return;

    if (editingId) {
      // UPDATE pakai map()
      dispatch({
        type: 'EDIT',
        payload: {
          id: editingId,
          data: {
            ...formInput,
            nilaiMateri1: Number(formInput.nilaiMateri1),
            nilaiMateri2: Number(formInput.nilaiMateri2),
            nilaiMateri3: Number(formInput.nilaiMateri3),
          },
        },
      });
      setEditingId(null);
    } else {
      // CREATE seperti biasa
      dispatch({
        type: 'ADD',
        payload: {
          ...formInput,
          nilaiMateri1: Number(formInput.nilaiMateri1),
          nilaiMateri2: Number(formInput.nilaiMateri2),
          nilaiMateri3: Number(formInput.nilaiMateri3),
        },
      });

      setFormInput(emptyForm);
    }

    handleCloseModal();
    console.log(formInput);
    console.log(filteredStudents)
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE', payload: id });
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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-xl mx-auto mt-8  p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Data Siswa
          </h1>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[70%] py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Button Open Modals */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition duration-200"
            onClick={() => addStudent()}
          >
            + Tambah Siswa
          </button>
        </div>

        {isModalOpen && (
          <Modals
            onClose={handleCloseModal}
            title={editingId ? 'Edit Siswa' : 'Tambah Siswa'}
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
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-400">
                  Belum ada data
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const nilaiAkhir =
                  (Number(student.nilaiMateri1) +
                    Number(student.nilaiMateri2) +
                    Number(student.nilaiMateri3)) /
                    3 || 0;
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-100 even:bg-gray-50"
                  >
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.level}</td>
                    <td>{student.kelas}</td>
                    <td>{student.nilaiMateri1}</td>
                    <td>{student.nilaiMateri2}</td>
                    <td>{student.nilaiMateri3}</td>
                    <td>{nilaiAkhir.toFixed(2)}</td>
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
      </div>
    </div>
  );
};

export default Student;
