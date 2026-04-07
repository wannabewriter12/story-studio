// ===============================
// CONSTANTS
// ===============================
const STORAGE_KEY = "ann_stories";

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
// ELEMENTS
// ===============================
const editor = document.getElementById("editor");
const statusEl = document.getElementById("status");
const wordCountEl = document.getElementById("wordCount");

// ===============================
// LOAD STORY
// ===============================
const params = new URLSearchParams(window.location.search);
const storyId = params.get("id");

let stories = [];
let story = null;

function loadStory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  stories = raw ? JSON.parse(raw) : [];
  story = stories.find((s) => s.id === storyId);

  if (!story) {
    alert("Story not found.");
    window.location.href = "index.html";
    return;
  }

  editor.innerHTML = story.content || "";
  updateWordCount();
}

// ===============================
// AUTOSAVE
// ===============================
let saveTimer;

function saveStory() {
  story.content = editor.innerHTML;
  const firstLine = editor.innerText.split("\n")[0].trim();
  story.title = firstLine || "Untitled story";
  story.updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  statusEl.textContent = "Saved";
}

function scheduleSave() {
  statusEl.textContent = "Saving...";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveStory, 500);
}

// ===============================
// WORD COUNT
// ===============================
function updateWordCount() {
  const text = editor.innerText.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  wordCountEl.textContent = words + " words";
}

// ===============================
// TOOLBAR COMMANDS
// ===============================
function setupToolbar() {
  document.querySelectorAll("[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
      editor.focus();
      scheduleSave();
      updateWordCount();
    });
  });

  const fontFamily = document.getElementById("fontFamily");
  const fontSize = document.getElementById("fontSize");
  const colorPicker = document.getElementById("colorPicker");

  if (fontFamily) {
    fontFamily.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value) {
        document.execCommand("fontName", false, value);
        editor.focus();
        scheduleSave();
        updateWordCount();
      }
    });
  }

  if (fontSize) {
    fontSize.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value) {
        document.execCommand("fontSize", false, value);
        editor.focus();
        scheduleSave();
        updateWordCount();
      }
    });
  }

  if (colorPicker) {
    colorPicker.addEventListener("change", (e) => {
      document.execCommand("foreColor", false, e.target.value);
      editor.focus();
      scheduleSave();
      updateWordCount();
    });
  }

  document.querySelectorAll("#colorPalette button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      document.execCommand("foreColor", false, color);
      editor.focus();
      scheduleSave();
      updateWordCount();
    });
  });
}

// ===============================
// DOWNLOAD AS DOCX
// ===============================
function setupDownload() {
  const btn = document.getElementById("downloadDocx");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const content = editor.innerHTML;

    const html =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
      `xmlns:w="urn:schemas-microsoft-com:office:word" ` +
      `xmlns="http://www.w3.org/TR/REC-html40">` +
      `<head><meta charset="utf-8"></head><body>${content}</body></html>`;

    const blob = new Blob([html], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (story.title || "story") + ".docx";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

// ===============================
// EDITOR INPUT
// ===============================
function setupEditor() {
  editor.addEventListener("input", () => {
    scheduleSave();
    updateWordCount();
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadStory();
  setupToolbar();
  setupDownload();
  setupEditor();
  hideLoader();
});
