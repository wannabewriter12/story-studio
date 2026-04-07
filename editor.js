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

function getStoryIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
    const theme = select.value;
    document.body.className = theme;
    localStorage.setItem(THEME_KEY, theme);
  });
}

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}

document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  setupThemeSelect();

  const id = getStoryIdFromUrl();
  const stories = loadStories();
  const story = stories.find((s) => s.id === id);

  const titleInput = document.getElementById("titleInput");
  const editor = document.getElementById("editor");

  if (!story) {
    // If no story found, redirect back
    window.location.href = "index.html";
    return;
  }

  titleInput.value = story.title || "";
  editor.value = story.content || "";

  let saveTimeout;

  function scheduleSave() {
    clearTimeout(saveTimeout);
    setStatus("Saving...");
    saveTimeout = setTimeout(() => {
      const all = loadStories();
      const index = all.findIndex((s) => s.id === id);
      if (index !== -1) {
        all[index] = {
          ...all[index],
          title: titleInput.value.trim() || "Untitled story",
          content: editor.value,
          updatedAt: new Date().toISOString(),
        };
        saveStories(all);
        setStatus("Saved");
      }
    }, 500);
  }

  titleInput.addEventListener("input", scheduleSave);
  editor.addEventListener("input", scheduleSave);
});
