import express from "express";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== GET ALL POSTS ====================

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json({
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== GET SINGLE POST ====================

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      post,
    });
  } catch (error) {
    console.error("Get post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== CREATE POST ====================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const post = await Post.create({
      title,
      content,
      image: image || "",
      author: req.user._id,
    });

    const populatedPost = await Post.findById(
      post._id
    ).populate("author", "name email");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== UPDATE POST ====================

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can edit only your own posts",
      });
    }

    if (title !== undefined) {
      post.title = title;
    }

    if (content !== undefined) {
      post.content = content;
    }

    if (image !== undefined) {
      post.image = image;
    }

    await post.save();

    const updatedPost = await Post.findById(
      post._id
    ).populate("author", "name email");

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== DELETE POST ====================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own posts",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;