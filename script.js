const PASSWORD_KEY = "ann_password";

// Ask for password before loading stories
function checkPassword() {
  const saved = localStorage.getItem(PASSWORD_KEY);

  // If no password set yet, ask user to create one
  if (!saved) {
    const newPass = prompt("Create a password to lock your stories:");
    if (newPass) {
      localStorage.setItem(PASSWORD_KEY, newPass);
      alert("Password set! Don't forget it.");
      return true;
    }
    return false;
  }

  // If password exists, ask user to enter it
  const entered = prompt("Enter your story password:");
  return entered === saved;
}

// Key for localStorage
const STORAGE_KEY = "ann_stories";
const THEME_KEY = "ann_theme";

function loadStories() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStories(stories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

function renderStories() {
  const stories = loadStories();
  const list = document.getElementById("storiesList");
  list.innerHTML = "";

  if (!stories.length) {
    list.classList.add("empty-state");
    list.innerHTML = "<p>No stories yet. Click “New Story” to start writing.</p>";
    return;
  }

  list.classList.remove("empty-state");

  stories.forEach((story) => {
    const card = document.createElement("div");
    card.className = "story-card";
    card.addEventListener("click", () => {
      window.location.href = `story.html?id=${encodeURIComponent(story.id)}`;
    });

    const title = document.createElement("h3");
    title.textContent = story.title || "Untitled story";

    const preview = document.createElement("p");
    preview.textContent =
      story.content?.slice(0, 120).trim() || "No content yet.";

    const footer = document.createElement("div");
    footer.className = "story-card-footer";

    const date = document.createElement("span");
    date.textContent = new Date(story.updatedAt).toLocaleString();

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const confirmed = confirm("Delete this story?");
      if (!confirmed) return;
      const remaining = loadStories().filter((s) => s.id !== story.id);
      saveStories(remaining);
      renderStories();
    });

    footer.appendChild(date);
    footer.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(footer);

    list.appendChild(card);
  });
}

function createNewStory() {
  const stories = loadStories();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newStory = {
    id,
    title: "Untitled story",
    content: "",
    createdAt: now,
    updatedAt: now,
  };

  stories.push(newStory);
  saveStories(stories);

  window.location.href = `story.html?id=${encodeURIComponent(id)}`;
}

function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "theme-minimal";
  document.body.className = saved;
  const select = document.getElementById("themeSelect");
  if (select) select.value = saved;
}

function setupThemeSelect() {
  const select = document.getElementById("themeSelect");
  if (!select) return;
  select.addEventListener("change", () => {
      if (!checkPassword()) {
    document.getElementById("storiesList").innerHTML =
      "<p>Incorrect password. No stories available.</p>";
    return;
  }

    const theme = select.value;
    document.body.className = theme;
    localStorage.setItem(THEME_KEY, theme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  setupThemeSelect();
  renderStories();

  const newBtn = document.getElementById("newStoryBtn");
  if (newBtn) {
    newBtn.addEventListener("click", createNewStory);
  }
});
