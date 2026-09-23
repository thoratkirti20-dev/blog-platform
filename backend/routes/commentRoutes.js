import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== GET COMMENTS FOR A POST ====================

router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json({
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== ADD COMMENT ====================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, postId } = req.body;

    if (!text || !postId) {
      return res.status(400).json({
        message: "Comment text and post ID are required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      text,
      post: postId,
      author: req.user._id,
    });

    const populatedComment = await Comment.findById(
      comment._id
    ).populate("author", "name email");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== DELETE COMMENT ====================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (
      comment.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can delete only your own comments",
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;