import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useTheme } from "../contexts/ThemeContext";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner" style={{ maxWidth: '900px' }}>
        <Link to="/" className="navbar-logo">SocialApp</Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          {user && <Link to={`/profile/${user._id}`}>Profile</Link>}
        </div>
        
        {user && (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
            <input 
              type="text" 
              placeholder="Search users or posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '20px', width: '200px' }}
            />
            <button type="submit" className="btn-primary sm">Search</button>
          </form>
        )}

        {user && <NotificationsPanel />}

        <button onClick={toggleTheme} className="btn-ghost" style={{ marginRight: '8px' }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button onClick={handleLogout} className="btn-ghost">Logout</button>
      </div>
    </nav>
  );
}
