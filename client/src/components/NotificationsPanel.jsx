import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // In a real app, you might poll this or use WebSockets. We'll fetch once on mount.
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button 
        className="btn-ghost" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: "relative", marginRight: "8px" }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            background: "var(--danger)",
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
            padding: "2px 6px",
            borderRadius: "10px"
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "40px",
          right: "0",
          width: "320px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-md)",
          zIndex: 1000,
          maxHeight: "400px",
          overflowY: "auto",
          padding: "10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ fontSize: "16px", margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-ghost" style={{ fontSize: "12px" }}>
                Mark all read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>No notifications yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {notifications.map(n => (
                <div 
                  key={n._id} 
                  onClick={() => {
                    if (!n.isRead) markAsRead(n._id);
                  }}
                  style={{ 
                    padding: "10px", 
                    background: n.isRead ? "transparent" : "var(--bg)", 
                    borderRadius: "8px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "1px solid var(--border)"
                  }}
                >
                  {n.sender.profilePicture ? (
                    <img src={`http://localhost:5000${n.sender.profilePicture}`} alt="" className="avatar-sm" />
                  ) : (
                    <div className="avatar-sm avatar-placeholder" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                      {n.sender.username[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, fontSize: "13px" }}>
                    <Link to={`/profile/${n.sender._id}`} style={{ fontWeight: "bold", textDecoration: "none" }}>
                      {n.sender.username}
                    </Link>{" "}
                    {n.type === "like" && "liked your post."}
                    {n.type === "comment" && "commented on your post."}
                    {n.type === "follow" && "started following you."}
                    
                    {n.post && (
                      <div style={{ color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                        "{n.post.content}"
                      </div>
                    )}
                  </div>
                  {!n.isRead && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
