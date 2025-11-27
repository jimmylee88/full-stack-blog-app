// create a new router
const app = require("express").Router();

// import the models
const { Post } = require("../models/index");

// Route to add a new post
app.post("/", async (req, res) => {
  try {
    const { title, content, postedBy } = req.body;
    const post = await Post.create({ title, content, postedBy });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error adding post" });
  }
});

// Route to get all posts
app.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [
        ["createdOn", "DESC"], //  show newest first instead of default behaviour
      ],
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving posts", error });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving post" });
  }
});

// Route to update a post
app.put("/:id", async (req, res) => {
  try {
    const { title, content, postedBy } = req.body;
    const post = await Post.update(
      { title, content, postedBy },
      { where: { id: req.params.id } }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
});

// Route to delete a post
app.delete("/:id", async (req, res) => {
  try {
    const deletedRows = await Post.destroy({ where: { id: req.params.id } });

    // Check if a row was actually deleted (optional but good)
    if (deletedRows === 0) {
      // If 0 rows were deleted, the post didn't exist
      return res.status(404).json({ error: "Post not found" });
    }

    // Use 204 No Content for a successful DELETE
    res.status(204).send();
  } catch (error) {
    console.error("Database error during post deletion:", error); // Log the error on the server
    res.status(500).json({ error: "Error deleting post" });
  }
});

// export the router
module.exports = app;
