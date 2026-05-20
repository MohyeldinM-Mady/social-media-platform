import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../store/slices/postSlice";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

export default function FeedPage({ explore = false }) {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.posts);

  useEffect(() => {
    dispatch(fetchPosts(explore));
  }, [dispatch, explore]);

  return (
    <div className="feed-page">
      <div className="feed-container">
        {!explore && <CreatePost />}
        {loading && <div className="loading">Loading posts…</div>}
        {error && <div className="error-msg">{error}</div>}
        {!loading && items.length === 0 && (
          <div className="empty-state">
            {explore
              ? "No posts yet. Be the first!"
              : "Your feed is empty. Follow people or check Explore."}
          </div>
        )}
        {items.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
