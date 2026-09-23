import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5000";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/posts/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Post not found");
        return;
      }

      setPost(data.post);
    } catch (error) {
      console.error("Fetch post error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/comments/post/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setComments(data.comments || []);
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      setMessage("Please enter a comment");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: commentText,
            postId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to add comment"
        );
        return;
      }

      setComments((currentComments) => [
        data.comment,
        ...currentComments,
      ]);

      setCommentText("");
      setMessage("Comment added successfully");
    } catch (error) {
      console.error("Add comment error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to delete comment"
        );
        return;
      }

      setComments((currentComments) =>
        currentComments.filter(
          (comment) => comment._id !== commentId
        )
      );

      setMessage("Comment deleted successfully");
    } catch (error) {
      console.error("Delete comment error:", error);
      setMessage("Unable to connect to server");
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-center">
        <div className="empty-state">
          <h2>{message || "Post not found"}</h2>
          <Link to="/posts">
            Back to Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <div>
          <h1>BlogSpace</h1>
          <p>Read, share and discuss ideas.</p>
        </div>

        <nav>
          <Link to="/posts">All Posts</Link>

          {token ? (
            <>
              <span className="welcome-text">
                Hi, {user?.name}
              </span>

              <button
                className="header-button logout-button"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="post-details-container">
        <Link
          to="/posts"
          className="back-link"
        >
          ← Back to Posts
        </Link>

        <article className="post-details-card">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="post-details-image"
            />
          )}

          <div className="post-details-content">
            <h2>{post.title}</h2>

            <div className="post-meta">
              <span>
                By{" "}
                {post.author?.name ||
                  "Unknown author"}
              </span>

              <span>
                {new Date(
                  post.createdAt
                ).toLocaleDateString()}
              </span>
            </div>

            <div className="post-full-content">
              {post.content}
            </div>
          </div>
        </article>

        <section className="comments-section">
          <div className="comments-heading">
            <h2>Comments</h2>
            <span>
              {comments.length} comment(s)
            </span>
          </div>

          {token ? (
            <form
              className="comment-form"
              onSubmit={handleAddComment}
            >
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(event.target.value)
                }
                placeholder="Write a comment..."
                rows="4"
              />

              <button
                type="submit"
                className="primary-button"
              >
                Add Comment
              </button>
            </form>
          ) : (
            <div className="login-comment-message">
              <p>
                Please login to comment.
              </p>

              <Link
                to="/login"
                className="primary-button"
              >
                Login
              </Link>
            </div>
          )}

          {message && (
            <p className="dashboard-message">
              {message}
            </p>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="empty-state">
                <p>No comments yet.</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isAuthor =
                  user &&
                  comment.author?._id === user.id;

                return (
                  <article
                    className="comment-card"
                    key={comment._id}
                  >
                    <div className="comment-top">
                      <div>
                        <strong>
                          {comment.author?.name ||
                            "Unknown user"}
                        </strong>

                        <span>
                          {new Date(
                            comment.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {isAuthor && (
                        <button
                          className="danger-button"
                          onClick={() =>
                            handleDeleteComment(
                              comment._id
                            )
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <p>{comment.text}</p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PostDetails;