import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchPosts = createAsyncThunk("posts/fetch", async (explore, { rejectWithValue }) => {
  try {
    const { data } = await api.get(explore ? "/posts/explore" : "/posts");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load posts");
  }
});

export const createPost = createAsyncThunk("posts/create", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create post");
  }
});

export const toggleLike = createAsyncThunk("posts/like", async (postId, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/posts/${postId}/like`);
    return { postId, likes: data.likes };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addComment = createAsyncThunk("posts/comment", async ({ postId, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/comments`, { text });
    return { postId, comment: data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deletePost = createAsyncThunk("posts/delete", async (postId, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${postId}`);
    return postId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const postSlice = createSlice({
  name: "posts",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPosts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPosts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchPosts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createPost.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(toggleLike.fulfilled, (s, a) => {
        const p = s.items.find((p) => p._id === a.payload.postId);
        if (p) p.likes = a.payload.likes;
      })
      .addCase(addComment.fulfilled, (s, a) => {
        const p = s.items.find((p) => p._id === a.payload.postId);
        if (p) p.comments.push(a.payload.comment);
      })
      .addCase(deletePost.fulfilled, (s, a) => {
        s.items = s.items.filter((p) => p._id !== a.payload);
      });
  },
});

export default postSlice.reducer;
