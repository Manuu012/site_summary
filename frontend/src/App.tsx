import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user, show login page
  if (!currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/site_summary/login" element={<LoginPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    );
  }

  // User is logged in, show main app
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          {/* We'll add Header component in next step */}
          <main className="main-content">
            <Routes>
              <Route path="/site_summary/analytics" element={<AnalyticsPage />} />
              <Route path="/site_summary/chat" element={<ChatPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;