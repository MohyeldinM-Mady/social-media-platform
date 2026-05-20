import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">SocialApp</Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          {user && <Link to={`/profile/${user._id}`}>Profile</Link>}
        </div>
        <button onClick={handleLogout} className="btn-ghost">Logout</button>
      </div>
    </nav>
  );
}
