import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toggleLike, addComment, deletePost } from "../store/slices/postSlice";

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const liked = post.likes.some((id) => id === user?._id || id?._id === user?._id);
  const isAuthor = post.author?._id === user?._id;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await dispatch(addComment({ postId: post._id, text: comment }));
    setComment("");
  };

  return (
    <div className="card post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?._id}`} className="post-author">
          <Avatar user={post.author} size="sm" />
          <span className="username">{post.author?.username}</span>
        </Link>
        <span className="post-date">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {isAuthor && (
          <button
            className="btn-ghost delete-btn"
            onClick={() => dispatch(deletePost(post._id))}
            title="Delete post"
          >
            ✕
          </button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      {post.image && (
        <img src={post.image} alt="post attachment" className="post-image" />
      )}

      <div className="post-actions">
        <button
          className={`btn-ghost ${liked ? "liked" : ""}`}
          onClick={() => dispatch(toggleLike(post._id))}
        >
          {liked ? "❤️" : "🤍"} {post.likes.length}
        </button>
        <button className="btn-ghost" onClick={() => setShowComments((v) => !v)}>
          💬 {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {post.comments.map((c, i) => (
            <div key={i} className="comment">
              <Link to={`/profile/${c.user?._id}`} className="comment-author">
                {c.user?.username}
              </Link>
              <span>{c.text}</span>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              maxLength={300}
            />
            <button type="submit" className="btn-primary sm">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function Avatar({ user, size = "sm" }) {
  if (!user) return null;
  if (user.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.username}
        className={`avatar-${size}`}
      />
    );
  }
  return (
    <div className={`avatar-${size} avatar-placeholder`}>
      {user.username?.[0]?.toUpperCase()}
    </div>
  );
}
