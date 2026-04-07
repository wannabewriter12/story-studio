// ===============================
// LOAD STORY
// ===============================
const editor = document.getElementById("editor");
const statusEl = document.getElementById("status");
const wordCountEl = document.getElementById("wordCount");

const params = new URLSearchParams(window.location.search);
const storyId = params.get("id");

let stories = JSON.parse(localStorage.getItem("ann_stories")) || [];
let story = stories.find((s) => s.id === storyId);

if (!story) {
  alert("Story not found.");
  window.location.href = "index.html";
}

// Load content into editor
editor.innerHTML = story.content || "";

// ===============================
// AUTOSAVE
// ===============================
let saveTimer;

function saveStory() {
  story.content = editor.innerHTML;
  const firstLine = editor.innerText.split("\n")[0].trim();
  story.title = firstLine || "Untitled story";
  story.updatedAt = new Date().toISOString();

  localStorage.setItem("ann_stories", JSON.stringify(stories));
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
document.querySelectorAll("[data-cmd]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cmd = btn.dataset.cmd;
    document.execCommand(cmd, false, null);
    editor.focus();
    scheduleSave();
    updateWordCount();
  });
});

// FONT FAMILY
const fontFamilySelect = document.getElementById("fontFamily");
fontFamilySelect.addEventListener("change", (e) => {
  const value = e.target.value;
  if (value) {
    document.execCommand("fontName", false, value);
    editor.focus();
    scheduleSave();
    updateWordCount();
  }
});

// FONT SIZE
const fontSizeSelect = document.getElementById("fontSize");
fontSizeSelect.addEventListener("change", (e) => {
  const value = e.target.value;
  if (value) {
    document.execCommand("fontSize", false, value);
    editor.focus();
    scheduleSave();
    updateWordCount();
  }
});

// COLOR PICKER
const colorPicker = document.getElementById("colorPicker");
colorPicker.addEventListener("change", (e) => {
  document.execCommand("foreColor", false, e.target.value);
  editor.focus();
  scheduleSave();
  updateWordCount();
});

// COLOR PALETTE
document.querySelectorAll("#colorPalette button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    document.execCommand("foreColor", false, color);
    editor.focus();
    scheduleSave();
    updateWordCount();
  });
});

// ===============================
// DOWNLOAD AS DOCX
// ===============================
const downloadBtn = document.getElementById("downloadDocx");
downloadBtn.addEventListener("click", () => {
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

// ===============================
// EDITOR INPUT
// ===============================
editor.addEventListener("input", () => {
  scheduleSave();
  updateWordCount();
});

// Initial word count
updateWordCount();
