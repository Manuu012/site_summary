import React, { useState, useRef, useEffect } from 'react';
import '../styles/customdropdown.css';

interface Website {
  id: number;
  title: string | null;
  url: string;
}

interface CustomDropdownProps {
  websites: Website[];
  selectedWebsite: Website | null;
  onSelect: (website: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  websites,
  selectedWebsite,
  onSelect,
  placeholder = '-- Select a website --'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (website: Website) => {
    onSelect(website.id.toString());
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedWebsite) {
      const title = selectedWebsite.title || 'No Title';
      const domain = selectedWebsite.url.replace(/https?:\/\/(www\.)?/, '');
      return `${title} - ${domain}`;
    }
    return placeholder;
  };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <label className="dropdown-label">Choose a website:</label>
      
      {/* Custom Dropdown Trigger */}
      <div 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className="trigger-text">{getDisplayText()}</span>
        <span className="trigger-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {/* Custom Dropdown Menu with Scroll */}
      {isOpen && (
        <div className="dropdown-menu">
          <ul className="website-list">
            {websites.length === 0 ? (
              <li className="website-option no-websites">
                No websites available
              </li>
            ) : (
              websites.map(website => (
                <li
                  key={website.id}
                  className={`website-option ${
                    selectedWebsite?.id === website.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSelect(website)}
                  title={`${website.title || 'No Title'} - ${website.url}`}
                >
                  <div className="option-content">
                    <div className="option-title">
                      {website.title || 'No Title'}
                    </div>
                    <div className="option-url">
                      {website.url.replace(/https?:\/\/(www\.)?/, '')}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;