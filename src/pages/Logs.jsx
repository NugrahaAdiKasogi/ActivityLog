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
        log.id === action.payload.id ? { ...log, ...action.payload } : log
      );
      return updatedLogs;
    default:
      return state;
  }
};

const Logs = () => {
  const [logs, dispatch] = useReducer(reducer, [], initialState);
  const emptyLogs = {
    tanggal: "",
    kelas: "",
    materi: "",
    catatan: "",
  };
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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">Logs</h1>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
              </form>
            </Modals>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
