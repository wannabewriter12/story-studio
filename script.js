// ===============================
// CONSTANTS
// ===============================
const STORAGE_KEY = "ann_stories";
const THEME_KEY = "ann_theme";
const PASSWORD_KEY = "ann_password";

// ===============================
// LOADER CONTROL
// ===============================
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("hidden");
    setTimeout(() => loader.remove(), 400);
  }
}

// ===============================
// STORAGE HELPERS
// ===============================
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

// ===============================
// PASSWORD SYSTEM
// ===============================
function checkPassword() {
  const saved = localStorage.getItem(PASSWORD_KEY);

  if (!saved) {
    const newPass = prompt("Create a password to lock your stories:");
    if (newPass) {
      localStorage.setItem(PASSWORD_KEY, newPass);
      alert("Password set.");
      return true;
    }
    return false;
  }

  const entered = prompt("Enter your story password:");
  if (entered === saved) return true;

  alert("Incorrect password.");
  return false;
}

// ===============================
// THEMES
// ===============================
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
    const theme = select.value;
    document.body.className = theme;
    localStorage.setItem(THEME_KEY, theme);
  });
}

// ===============================
// STORY LIST RENDERING
// ===============================
function renderStories() {
  const stories = loadStories();
  const list = document.getElementById("storiesList");
  list.innerHTML = "";

  if (!stories.length) {
    list.innerHTML = "<p>No stories yet. Click “New Story”.</p>";
    return;
  }

  stories
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((story) => {
      const card = document.createElement("div");
      card.className = "story-card";

      card.addEventListener("click", () => {
        window.location.href = `story.html?id=${encodeURIComponent(story.id)}`;
      });

      const title = document.createElement("h3");
      title.textContent = story.title || "Untitled story";

      const preview = document.createElement("p");
      preview.textContent =
        (story.content || "").replace(/<[^>]*>/g, "").slice(0, 120) ||
        "No content yet.";

      const meta = document.createElement("div");
      meta.className = "story-meta";
      meta.textContent = new Date(story.updatedAt).toLocaleString();

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "deleteBtn";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm("Delete this story?")) return;
        const remaining = loadStories().filter((s) => s.id !== story.id);
        saveStories(remaining);
        renderStories();
      });

      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(meta);
      card.appendChild(deleteBtn);

      list.appendChild(card);
    });
}

// ===============================
// NEW STORY
// ===============================
function createNewStory() {
  const stories = loadStories();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const new
