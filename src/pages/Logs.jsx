import { useEffect, useReducer, useState } from "react";
import Modals from "../components/layout/Modals";

const initialState = () => {
  try {
    const logs = localStorage.getItem("logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Error parsing logs from localStorage:", error);
    return [];
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_LOG":
      const newLogs = [...state, action.payload];
      return newLogs;
    case "DELETE_LOG":
      const filteredLogs = state.filter((log) => log.id !== action.payload);
      return filteredLogs;
    case "EDIT_LOG":
      const updatedLogs = state.map((log) =>
        log.id === action.payload.id ? { ...log, ...action.payload } : log,
      );
      return updatedLogs;
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
  const [logs, dispatch] = useReducer(reducer, [], initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logForm, setLogForm] = useState(emptyLogs);

  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!logForm.tanggal || !logForm.kelas || !logForm.materi) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingId) {
      dispatch({ type: "EDIT_LOG", payload: { ...logForm, id: editingId } });
      setEditingId(null);
    } else {
      dispatch({ type: "ADD_LOG", payload: { ...logForm, id: Date.now() } });
      setLogForm(emptyLogs);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setLogForm(emptyLogs);
  };

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_LOG", payload: id });
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
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">Logs</h1>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => addLogs()}
            >
              Add Log
            </button>
          </div>

          {isModalOpen && (
            <Modals
              onClose={handleCloseModal}
              title={editingId ? "Edit Logs" : "Tambah Logs"}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields would go here */}
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={logForm.tanggal}
                  onChange={(e) =>
                    setLogForm({ ...logForm, tanggal: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">
                  Kelas
                </label>
                <input
                  type="text"
                  value={logForm.kelas}
                  onChange={(e) =>
                    setLogForm({ ...logForm, kelas: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">
                  Materi
                </label>
                <input
                  type="text"
                  value={logForm.materi}
                  onChange={(e) =>
                    setLogForm({ ...logForm, materi: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">
                  Yang Tidak Hadir
                </label>
                <textarea
                  value={logForm.tidakHadir}
                  onChange={(e) =>
                    setLogForm({ ...logForm, tidakHadir: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />


                <label className="block text-sm font-medium text-gray-700">
                  Catatan
                </label>
                <textarea
                  value={logForm.catatan}
                  onChange={(e) =>
                    setLogForm({ ...logForm, catatan: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleCloseModal}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </Modals>
          )}
          {/* Logs list would go here */}
          <div className="mt-8">
            {/* Render the list of logs here */}
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs available.</p>
            ) : (
              <div className="space-y-2">
                {processLogs.map((log) => (
                  <div
                    className="relative border-l-2 border-gray-200 ml-4"
                    key={log.id}
                  >
                    <div className="mb-10 ml-6 flex items-start">
                      <div className="absolute -left-1.5 w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>

                      <div className="mr-4 text-sm font-semibold text-gray-500 min-w-[100px]">
                        {new Date(log.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>

                      <div className="flex-1 p-4 bg-white rounded-lg shadow-md border border-gray-100">
                        <h3 className="font-bold text-lg text-blue-600">
                          Kelas: {log.kelas}
                        </h3>
                        <p className="text-gray-700">Materi: {log.materi}</p>
                        <p className="text-sm text-gray-500 mt-2 italic">
                          Catatan: {log.catatan}
                        </p>
                        {log.tidakHadir && (
                          <p className="text-sm text-red-500 mt-2 italic">
                            Tidak Hadir: {log.tidakHadir}
                          </p>
                        )}
                      </div>
                      {/* Edit button would go here */}
                      <div className="ml-4 flex space-x-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() => handleEdit(log)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() => handleDelete(log.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
