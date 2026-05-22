import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PostCard from "../components/PostCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token"); // Note: should probably use redux if auth uses localStorage
        // Since we need the token, let's just get it from Redux or localStorage. 
        // Our project has it in localStorage likely, or we can use the same pattern as fetchPosts.
        // Wait, standard fetch needs token. Let's assume we import the custom axios instance or standard fetch.
        const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="feed-page">
      <h2>Search Results for "{query}"</h2>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error-msg">{error}</div>}
      
      {!loading && !error && (
        <div style={{ marginTop: '20px' }}>
          <h3>Users ({results.users.length})</h3>
          {results.users.length === 0 ? (
            <p className="text-muted">No users found.</p>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {results.users.map(user => (
                <Link key={user._id} to={`/profile/${user._id}`} className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', width: '200px' }}>
                  {user.profilePicture ? (
                    <img src={`http://localhost:5000${user.profilePicture}`} alt="" className="avatar-sm" />
                  ) : (
                    <div className="avatar-sm avatar-placeholder">{user.username[0].toUpperCase()}</div>
                  )}
                  <span style={{ fontWeight: 'bold' }}>{user.username}</span>
                </Link>
              ))}
            </div>
          )}

          <h3>Posts ({results.posts.length})</h3>
          {results.posts.length === 0 ? (
            <p className="text-muted">No posts found.</p>
          ) : (
            <div className="feed-container">
              {results.posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
