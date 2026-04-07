// ===============================
// STORAGE + PASSWORD
// ===============================
const STORAGE_KEY = "ann_stories";
const THEME_KEY = "ann_theme";
const PASSWORD_KEY = "ann_password";

// Load stories
function loadStories() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save stories
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
      alert("Password set. Don’t forget it.");
      return true;
    }
    return false;
  }

  const entered = prompt("Enter your story password:");
  return entered === saved;
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
// STORY LIST
// ===============================
function renderStories() {
  const stories = loadStories();
  const list = document.getElementById("storiesList");
  list.innerHTML = "";

  if (!stories.length) {
    list.innerHTML = "<p>No stories yet. Click “New Story” to start.</p>";
    return;
  }

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

// ===============================
// BACKUP DOWNLOAD
// ===============================
function setupBackupButton() {
  const btn = document.getElementById("backupBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const stories = loadStories();
    const blob = new Blob([JSON.stringify(stories, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ann_stories_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ===============================
// IMPORT BACKUP
// ===============================
function setupImportButton() {
  const btn = document.getElementById("importBtn");
  const fileInput = document.getElementById("importFile");
  if (!btn || !fileInput) return;

  btn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error();
        saveStories(data);
        alert("Backup imported!");
        renderStories();
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (!checkPassword()) {
    const list = document.getElementById("storiesList");
    if (list) list.innerHTML = "<p>Incorrect password. No stories shown.</p>";
    return;
  }

  applySavedTheme();
  setupThemeSelect();
  setupBackupButton();
  setupImportButton();
  renderStories();

  const newBtn = document.getElementById("newStoryBtn");
  if (newBtn) newBtn.addEventListener("click", createNewStory);
});
