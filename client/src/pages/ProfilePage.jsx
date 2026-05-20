import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../store/slices/authSlice";
import api from "../api/axios";
import PostCard, { Avatar } from "../components/PostCard";

export default function ProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwn = currentUser?._id === id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data.user);
        setPosts(data.posts);
        setBio(data.user.bio || "");
        setFollowing(
          data.user.followers.some(
            (f) => f === currentUser?._id || f?._id === currentUser?._id
          )
        );
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [id, currentUser]);

  const handleFollow = async () => {
    await api.put(`/users/${id}/follow`);
    setFollowing((f) => !f);
    setProfile((p) => ({
      ...p,
      followers: following
        ? p.followers.filter((f) => f !== currentUser._id)
        : [...p.followers, currentUser._id],
    }));
  };

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", { bio });
      dispatch(updateUser(data));
      setProfile(data);
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (!profile) return <div className="error-msg" style={{ margin: 32 }}>User not found.</div>;

  return (
    <div className="profile-page">
      <div className="card profile-header">
        <Avatar user={profile} size="lg" />
        <div className="profile-info">
          <h2>{profile.username}</h2>

          {editing ? (
            <div className="edit-form">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="Write a bio…"
              />
              <div className="edit-actions">
                <button className="btn-primary sm" onClick={handleSaveBio} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="btn-ghost sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="bio">{profile.bio || "No bio yet."}</p>
          )}

          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followers.length}</strong> followers</span>
            <span><strong>{profile.following.length}</strong> following</span>
          </div>

          {isOwn ? (
            <button className="btn-ghost" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          ) : (
            <button
              className={`btn-primary ${following ? "outlined" : ""}`}
              onClick={handleFollow}
            >
              {following ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="feed-container" style={{ marginTop: 12 }}>
        {posts.length === 0 ? (
          <div className="empty-state">No posts yet.</div>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} />)
        )}
      </div>
    </div>
  );
}
