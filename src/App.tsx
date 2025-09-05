import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IntroPage from './components/IntroPage';
import { useMPIFStore } from './store/mpifStore';

function AppContent() {
  const navigate = useNavigate();
  const loadMPIFFile = useMPIFStore((state) => state.loadMPIFFile);
  const createNewMPIF = useMPIFStore((state) => state.createNewMPIF);

  const handleCreate = () => {
    createNewMPIF();
    navigate('/dashboard');
  };

  const handleFileUploaded = async (content: string, fileName: string) => {
    await loadMPIFFile(content, fileName);
    navigate('/dashboard');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<IntroPage onCreate={handleCreate} onFileUpload={handleFileUploaded} />} 
      />
      <Route 
        path="/dashboard" 
        element={<Dashboard />} 
      />
      <Route 
        path="*" 
        element={<div className="flex items-center justify-center h-screen">Page Not Found</div>} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App; 