import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DatabasePage from './components/DatabasePage';
import IntroPage from './components/IntroPage';
import { MPIFDocumentation } from './components/MPIFDocumentation';
import { OrcidCallback } from './components/OrcidCallback';
import { useMPIFStore } from './store/mpifStore';
import { useThemeStore } from './store/themeStore';

function App() {
  useThemeStore();
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
            path="/database"
            element={<DatabasePage />}
          />
          <Route
            path="/documentation"
            element={<MPIFDocumentation />}
          />
          <Route
            path="/orcid-callback"
            element={<OrcidCallback />}
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
  const loadDraft = useMPIFStore((state) => state.loadDraft);
  const getDraftInfo = useMPIFStore((state) => state.getDraftInfo);

  const handleCreate = () => {
    createNewMPIF();
    navigate('/dashboard');
  };

  const handleFileUploaded = async (content: string, fileName: string) => {
    await loadMPIFFile(content, fileName);
    navigate('/dashboard');
  };

  const handleLoadDraft = () => {
    if (loadDraft()) {
      navigate('/dashboard');
    }
  };

  const handleOpenDatabase = () => {
    navigate('/database');
  };

  return (
    <IntroPage
      onCreate={handleCreate}
      onFileUpload={handleFileUploaded}
      onOpenDatabase={handleOpenDatabase}
      onLoadDraft={handleLoadDraft}
      draftInfo={getDraftInfo()}
    />
  );
}

export default App;
