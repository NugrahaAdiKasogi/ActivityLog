import { useState } from 'react';
import { Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Student from './pages/Student';
import Navbar from './components/layout/Navbar';
import Header from './components/layout/Header';


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-200 h-screen">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* header */}
      <main className="flex-1">
        <Header setSidebarOpen={setSidebarOpen} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="logs" element={<Logs />} />
          <Route path="student" element={<Student />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
