// ----------------------
// LOADER
// ----------------------
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  loadTheme();
  loadStory();
  setupToolbar();
});

// ----------------------
// THEME
// ----------------------
function loadTheme() {
  const saved = localStorage.getItem("storyTheme") || "theme-minimal";
  document.body.className = saved;
}

// ----------------------
// STORY STORAGE
// ----------------------
function loadStories() {
  return JSON.parse(localStorage.getItem("stories") || "[]");
}

function saveStories(stories) {
  localStorage.setItem("stories", JSON.stringify(stories));
}

// ----------------------
// LOAD STORY INTO EDITOR
// ----------------------
let currentStory = null;

function loadStory() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const stories = loadStories();
  currentStory = stories.find(s => s.id === id);

  if (!currentStory) {
    alert("Story not found.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("editor").innerHTML = currentStory.content;
  updateWordCount();
}

// ----------------------
// AUTOSAVE
// ----------------------
function autosave() {
  const stories = loadStories();
  const index = stories.findIndex(s => s.id === currentStory.id);

  if (index !== -1) {
    stories[index].content = document.getElementById("editor").innerHTML;
    stories[index].updatedAt = new Date().toISOString();
    saveStories(stories);
  }

  document.getElementById("status").textContent = "Saved";
}

setInterval(autosave, 1000);

// ----------------------
// WORD COUNT
// ----------------------
function updateWordCount() {
  const text = document.getElementById("editor").innerText.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  document.getElementById("wordCount").textContent = `${words} words`;
}

document.getElementById("editor").addEventListener("input", () => {
  document.getElementById("status").textContent = "Saving...";
  updateWordCount();
});

// ----------------------
// TOOLBAR
// ----------------------
function setupToolbar() {
  document.querySelectorAll("[data-cmd]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.execCommand(btn.dataset.cmd, false, null);
    });
  });

  document.getElementById("fontFamily").addEventListener("change", e => {
    document.execCommand("fontName", false, e.target.value);
  });

  document.getElementById("fontSize").addEventListener("change", e => {
    document.execCommand("fontSize", false, e.target.value);
  });

  document.getElementById("colorPicker").addEventListener("input", e => {
    document.execCommand("foreColor", false, e.target.value);
  });

  document.querySelectorAll("#colorPalette button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.execCommand("foreColor", false, btn.dataset.color);
    });
  });

  document.getElementById("downloadDocx").addEventListener("click", downloadDocx);
}

// ----------------------
// DOWNLOAD DOCX
// ----------------------
function downloadDocx() {
  const content = document.getElementById("editor").innerText;
  const blob = new Blob([content], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentStory.title}.txt`;
  a.click();

  URL.revokeObjectURL(a.href);
}

