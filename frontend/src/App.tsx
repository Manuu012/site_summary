import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Site Summary - Web Crawler & AI Chat</h1>
        <p>Full Stack Developer Assignment</p>
        <div className="status">
          <div className="status-item">
            <span className="status-dot backend"></span>
            Backend: NestJS + PostgreSQL ✅
          </div>
          <div className="status-item">
            <span className="status-dot frontend"></span>
            Frontend: React + TypeScript ✅
          </div>
          <div className="status-item">
            <span className="status-dot features"></span>
            Features: Web Crawler + AI Chat + Analytics
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;