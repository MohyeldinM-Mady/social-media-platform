import { useState } from "react";
import { useDispatch } from "react-redux";
import { createPost } from "../store/slices/postSlice";

export default function CreatePost() {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("content", content);
    if (image) fd.append("image", image);
    await dispatch(createPost(fd));
    setContent("");
    setImage(null);
    e.target.reset();
    setLoading(false);
  };

  return (
    <div className="card create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={500}
          rows={3}
        />
        <div className="create-post-footer">
          <label className="file-label">
            📎 Photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              hidden
            />
          </label>
          {image && <span className="file-name">{image.name}</span>}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !content.trim()}
          >
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
