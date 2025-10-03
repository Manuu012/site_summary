import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>Site Summary</h1>
          <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢' : '🔴'}
          </span>
        </div>
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link 
            to="/site_summary/chat" 
            className={location.pathname.includes('/chat') ? 'active' : ''}
          >
            Chat
          </Link>
          <Link 
            to="/site_summary/analytics" 
            className={location.pathname.includes('/analytics' )? 'active' : ''}
          >
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;