// LOADER
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("fade-out");
  setTimeout(() => loader && (loader.style.display = "none"), 300);
}

// THEME
function loadTheme() {
  const saved = localStorage.getItem("storyTheme") || "theme-pastel";
  document.body.className = saved;
}

// STORAGE
function loadStories() {
  return JSON.parse(localStorage.getItem("stories") || "[]");
}

function saveStories(stories) {
  localStorage.setItem("stories", JSON.stringify(stories));
}

let currentStory = null;

// LOAD STORY
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

  const editor = document.getElementById("editor");
  editor.innerHTML = currentStory.content || "";
  updateWordCount();
}

// AUTOSAVE
function autosave() {
  if (!currentStory) return;

  const stories = loadStories();
  const index = stories.findIndex(s => s.id === currentStory.id);
  if (index === -1) return;

  const editor = document.getElementById("editor");
  stories[index].content = editor.innerHTML;
  stories[index].plainText = editor.innerText;
  stories[index].updatedAt = new Date().toISOString();

  saveStories(stories);
  currentStory = stories[index];

  document.getElementById("status").textContent = "Saved";
}

setInterval(autosave, 1200);

// WORD COUNT
function updateWordCount() {
  const text = document.getElementById("editor").innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  document.getElementById("wordCount").textContent = `${words} words`;
}

// TOOLBAR
function setupToolbar() {
  document.querySelectorAll("[data-cmd]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.execCommand(btn.dataset.cmd, false, null);
      document.getElementById("editor").focus();
    });
  });

  document.getElementById("fontFamily").addEventListener("change", e => {
    if (!e.target.value) return;
    document.execCommand("fontName", false, e.target.value);
    document.getElementById("editor").focus();
  });

  document.getElementById("fontSize").addEventListener("change", e => {
    if (!e.target.value) return;
    document.execCommand("fontSize", false, e.target.value);
    document.getElementById("editor").focus();
  });

  document.getElementById("colorPicker").addEventListener("input", e => {
    document.execCommand("foreColor", false, e.target.value);
    document.getElementById("editor").focus();
  });

  document.querySelectorAll("#colorPalette .swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      document.execCommand("foreColor", false, btn.dataset.color);
      document.getElementById("editor").focus();
    });
  });

  document.getElementById("downloadDocx").addEventListener("click", downloadDocx);
}

// DOWNLOAD (plain text)
function downloadDocx() {
  const content = document.getElementById("editor").innerText;
  const title = (currentStory && currentStory.title) || "story";
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  loadTheme();
  loadStory();
  setupToolbar();

  document.getElementById("editor").addEventListener("input", () => {
    document.getElementById("status").textContent = "Saving...";
    updateWordCount();
  });
});

