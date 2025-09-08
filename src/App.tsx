import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IntroPage from './components/IntroPage';
import { MPIFDocumentation } from './components/MPIFDocumentation';
import { useMPIFStore } from './store/mpifStore';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<IntroPageWrapper />} 
          />
          <Route 
            path="/dashboard" 
            element={<Dashboard />} 
          />
          <Route 
            path="/documentation" 
            element={<MPIFDocumentation />} 
          />
          <Route 
            path="*" 
            element={<div className="flex items-center justify-center h-screen">Page Not Found</div>} 
          />
        </Routes>
      </div>
    </Router>
  );
}

function IntroPageWrapper() {
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

  return <IntroPage onCreate={handleCreate} onFileUpload={handleFileUploaded} />;
}

export default App; 