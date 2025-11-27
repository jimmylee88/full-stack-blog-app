let token = localStorage.getItem("authToken");

let currentEditPostId = null;
let isEditing = false;

function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        token = data.token;

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("http://localhost:3001/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    token = null;
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
  });
}

function fetchPosts() {
  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("posts");
      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const div = document.createElement("div");
        const deleteButton = `<button class="delete-button" onclick="onClickDeleteButton(this, '${post.id}')">Delete</button>`;

        const safeTitle = post.title
          .replace(/'/g, "\\'") // Escape single quote
          .replace(/"/g, "&quot;") // HTML entity for double quote
          .replace(/`/g, "\\`"); // Escape backtick

        const safeContent = post.content
          .replace(/'/g, "\\'")
          .replace(/"/g, "&quot;")
          .replace(/`/g, "\\`");

        const editButton = `<button class="edit-button" 
          onclick="onClickEditButton(this, '${post.id}', 
          '${safeTitle}',
          '${safeContent}')">Edit</button>`;

        div.innerHTML = `
          <h3 data-post-id="${post.id}" class="post-title-display">${
          post.title
        }</h3>
          <p>${post.content}</p>
          <small>By: ${post.postedBy} on ${new Date(
          post.createdOn
        ).toLocaleString()}</small>
        <div class="post-actions">${editButton} ${deleteButton}</div>
        `;
        postsContainer.appendChild(div);
      });
    });
}

function createPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";

      fetchPosts();
    });
}

// Delete post function
async function onClickDeleteButton(e, postId) {
  // Get the parent list element of button
  const postContainerDiv = e.parentElement.parentElement;

  try {
    // Send delete request
    const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      postContainerDiv.remove();
      console.log(`Removed post: ${postId}`);
    } else {
      const data = await response.json();
      alert("Error with removing post");
    }
  } catch (error) {
    console.error("Error with removing post:", error);
  }
}

// Resets form and state into create mode
function cancelEditMode() {
  isEditing = false;
  currentEditPostId = null;

  // Clears form input
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";

  document.getElementById("main-submit-btn").textContent = "Create Post";
  document.getElementById("cancel-edit-btn").classList.add("hidden");
}

// PUT request to update the post
async function updatePost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  const postId = currentEditPostId;

  try {
    const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      alert("Post updated!");
      cancelEditMode();
      fetchPosts();
    } else {
      const errorData = await response.json();
      alert(`Failed to update post: ${errorData.error || "Server error"}`);
    }
  } catch (error) {
    console.error("Error updating post:", error);
    alert("Error updating the post");
  }
}

function onClickEditButton(e, postId, currentTitle, currentContent) {
  console.log("Edit button clicked! Post ID: ", postId);
  try {
    currentEditPostId = postId;
    isEditing = true;

    document.getElementById("post-title").value = currentTitle;
    document.getElementById("post-content").value = currentContent;

    document.getElementById("main-submit-btn").textContent = "Save Changes";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    const appContainer = document.getElementById("app-container");
    if (appContainer) {
      appContainer.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("Error inside onClickEditButton", error);
    alert("An error occurred during Edit. Check console for details");
  }
}

function handlePostSubmit() {
  if (isEditing) {
    updatePost();
  } else {
    createPost();
  }
}
