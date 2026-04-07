// LOADER
function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("fade-out");
  setTimeout(() => {
    loader.style.display = "none";
  }, 300);
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
  currentStory = stories.find((s) => s.id === id);

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
  const index = stories.findIndex((s) => s.id === currentStory.id);
  if (index === -1) return;

  const editor = document.getElementById("editor");
  stories[index].content = editor.innerHTML;
  stories[index].plainText = editor.innerText;
  stories[index].updatedAt = new Date().toISOString();

  saveStories(stories);
  currentStory = stories[index];

  const status = document.getElementById("status");
  if (status) status.textContent = "Saved";
}

setInterval(autosave, 1200);

// WORD COUNT
function updateWordCount() {
  const editor = document.getElementById("editor");
  const text = editor.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const wc = document.getElementById("wordCount");
  if (wc) wc.textContent = `${words} words`;
}

// TOOLBAR (top + floating)
function setupToolbar() {
  const editor = document.getElementById("editor");

  // Top toolbar buttons
  document.querySelectorAll("[data-cmd]").forEach((btn) => {
    if (btn.closest(".floating-toolbar")) return;
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      if (!cmd) return;
      document.execCommand(cmd, false, null);
      editor.focus();
    });
  });

  // Font family
  const fontFamily = document.getElementById("fontFamily");
  if (fontFamily) {
    fontFamily.addEventListener("change", (e) => {
      const value = e.target.value;
      if (!value) return;
      document.execCommand("fontName", false, value);
      editor.focus();
    });
  }

  // Font size
  const fontSize = document.getElementById("fontSize");
  if (fontSize) {
    fontSize.addEventListener("change", (e) => {
      const value = e.target.value;
      if (!value) return;
      document.execCommand("fontSize", false, value);
      editor.focus();
    });
  }

  // Color picker
  const colorPicker = document.getElementById("colorPicker");
  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      document.execCommand("foreColor", false, e.target.value);
      editor.focus();
    });
  }

  // Palette
  document.querySelectorAll("#colorPalette .swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-color");
      if (!color) return;
      document.execCommand("foreColor", false, color);
      editor.focus();
    });
  });

  // Floating toolbar buttons
  document.querySelectorAll(".floating-toolbar .fbtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      if (!cmd) return;
      document.execCommand(cmd, false, null);
      editor.focus();
    });
  });

  // Floating font size
  const floatFontSize = document.getElementById("floatFontSize");
  if (floatFontSize) {
    floatFontSize.addEventListener("change", (e) => {
      const value = e.target.value;
      if (!value) return;
      document.execCommand("fontSize", false, value);
      editor.focus();
    });
  }

  // Floating color picker
  const floatColorPicker = document.getElementById("floatColorPicker");
  if (floatColorPicker) {
    floatColorPicker.addEventListener("input", (e) => {
      document.execCommand("foreColor", false, e.target.value);
      editor.focus();
    });
  }

  // Download
  const downloadBtn = document.getElementById("downloadDocx");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const content = editor.innerText;
      const title = (currentStory && currentStory.title) || "story";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

// FLOATING TOOLBAR AUTO-HIDE
function setupFloatingToolbarBehavior() {
  const editor = document.getElementById("editor");
  const floatingBar = document.querySelector(".floating-toolbar");
  if (!editor || !floatingBar) return;

  let typingTimeout;

  function showBar() {
    floatingBar.classList.remove("hide");
  }

  function hideBar() {
    floatingBar.classList.add("hide");
  }

  editor.addEventListener("focus", showBar);
  editor.addEventListener("blur", hideBar);

  editor.addEventListener("input", () => {
    hideBar();
    const status = document.getElementById("status");
    if (status) status.textContent = "Saving...";
    updateWordCount();

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      showBar();
    }, 600);
  });

  showBar();
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  loadTheme();
  loadStory();
  setupToolbar();
  setupFloatingToolbarBehavior();
  updateWordCount();
});

