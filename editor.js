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

function setupToolbar(editor) {
  const buttons = document.querySelectorAll(".toolbar button[data-cmd]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      document.execCommand(cmd, false, null);
      editor.focus();
    });
  });

  const fontFamily = document.getElementById("fontFamily");
  const fontSize = document.getElementById("fontSize");

  fontFamily.addEventListener("change", () => {
    const value = fontFamily.value;
    if (value) {
      document.execCommand("fontName", false, value);
    }
    editor.focus();
  });

  fontSize.addEventListener("change", () => {
    const value = fontSize.value;
    if (value) {
      document.execCommand("fontSize", false, "4"); // use a base size
      // Then adjust via CSS if you want more control later
    }
    editor.focus();
  });
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
    window.location.href = "index.html";
    return;
  }

  titleInput.value = story.title || "";
  editor.innerHTML = story.content || "";

  setupToolbar(editor);

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
          content: editor.innerHTML, // save formatted HTML
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
