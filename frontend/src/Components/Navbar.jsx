import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/Home" className="navbar-logo">
          <div className="logo-icon">BH</div>
          <span className="logo-text">BookHive</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link 
            to="/Home" 
            className={`nav-link ${isActive('/Home') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link 
            to="/BrowseBooks" 
            className={`nav-link ${isActive('/BrowseBooks') ? 'active' : ''}`}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">Browse Books</span>
          </Link>

          <Link 
            to="/MyListings" 
            className={`nav-link ${isActive('/MyListings') ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">My Listings</span>
          </Link>

          <Link 
            to="/chat" 
            className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Chat</span>
          </Link>

          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </Link>

          <Link 
            to="/wishlist" 
            className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}
          >
            <span className="nav-icon">❤️</span>
            <span className="nav-text">Wishlist</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Search books, authors, courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {/* Notifications */}
          <div className="notification-wrapper">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-read-btn">Mark all as read</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <p className="notification-title">New request for "Introduction to Algorithms"</p>
                      <p className="notification-time">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <p className="notification-title">Your listing has been viewed 5 times</p>
                      <p className="notification-time">1 hour ago</p>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-content">
                      <p className="notification-title">Message from John about Physics book</p>
                      <p className="notification-time">3 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="notification-footer">
                  <Link to="/notifications">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="user-menu">
            <button className="user-btn">
              <div className="user-avatar">A</div>
              <span className="user-name">Account</span>
              <span className="dropdown-arrow">▼</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;