import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Posts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
  });

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load posts");
        return;
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error("Fetch posts error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const url = editingPost
        ? `${API_URL}/api/posts/${editingPost._id}`
        : `${API_URL}/api/posts`;

      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Operation failed");
        return;
      }

      if (editingPost) {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post._id === editingPost._id
              ? data.post
              : post
          )
        );

        setMessage("Post updated successfully");
      } else {
        setPosts((currentPosts) => [
          data.post,
          ...currentPosts,
        ]);

        setMessage("Post created successfully");
      }

      setFormData({
        title: "",
        content: "",
        image: "",
      });

      setEditingPost(null);
      setShowForm(false);
    } catch (error) {
      console.error("Post operation error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const startEditing = (post) => {
    setEditingPost(post);

    setFormData({
      title: post.title || "",
      content: post.content || "",
      image: post.image || "",
    });

    setShowForm(true);
    setMessage("");
  };

  const cancelForm = () => {
    setEditingPost(null);

    setFormData({
      title: "",
      content: "",
      image: "",
    });

    setShowForm(false);
    setMessage("");
  };

  const deletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete post");
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.filter(
          (post) => post._id !== postId
        )
      );

      setMessage("Post deleted successfully");
    } catch (error) {
      console.error("Delete post error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="blog-page">
      <header className="blog-header">
        <div>
          <h1>BlogSpace</h1>
          <p>Share ideas. Read stories. Join the conversation.</p>
        </div>

        <nav>
          <Link to="/posts">Home</Link>

          {token && (
            <button
              className="header-button"
              onClick={() => {
                setShowForm(true);
                setEditingPost(null);
                setFormData({
                  title: "",
                  content: "",
                  image: "",
                });
              }}
            >
              Create Post
            </button>
          )}

          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span className="welcome-text">
                Hi, {user?.name}
              </span>

              <button
                className="header-button logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="posts-container">
        {showForm && (
          <section className="post-form-card">
            <h2>
              {editingPost
                ? "Edit Post"
                : "Create New Post"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">
                  Content
                </label>

                <textarea
                  id="content"
                  name="content"
                  rows="7"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your post..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">
                  Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingPost
                    ? "Update Post"
                    : "Publish Post"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {message && (
          <p className="dashboard-message">
            {message}
          </p>
        )}

        <section className="posts-section">
          <div className="section-title">
            <div>
              <h2>Latest Posts</h2>
              <p>Discover what people are sharing.</p>
            </div>

            <span>
              {posts.length} post(s)
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <h3>No posts yet</h3>

              <p>
                Be the first person to publish a post.
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => {
                const isAuthor =
                  user &&
                  post.author?._id === user.id;

                return (
                  <article
                    className="post-card"
                    key={post._id}
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="post-image"
                      />
                    )}

                    <div className="post-card-content">
                      <h3>{post.title}</h3>

                      <p className="post-author">
                        By{" "}
                        {post.author?.name ||
                          "Unknown author"}
                      </p>

                      <p className="post-preview">
                        {post.content.length > 160
                          ? `${post.content.slice(
                              0,
                              160
                            )}...`
                          : post.content}
                      </p>

                      <p className="post-date">
                        {new Date(
                          post.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <div className="post-actions">
                        <Link
                          to={`/posts/${post._id}`}
                          className="primary-button"
                        >
                          Read More
                        </Link>

                        {isAuthor && (
                          <>
                            <button
                              className="secondary-button"
                              onClick={() =>
                                startEditing(post)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="danger-button"
                              onClick={() =>
                                deletePost(
                                  post._id
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Posts;