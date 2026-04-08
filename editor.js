// =========================
// Loader
// =========================
function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("fade-out");
  setTimeout(() => {
    loader.style.display = "none";
  }, 300);
}

// =========================
// Theme
// =========================
function loadTheme() {
  const saved = localStorage.getItem("storyTheme") || "theme-pastel";
  document.body.className = saved;
}

// =========================
// Storage
// =========================
function loadStories() {
  return JSON.parse(localStorage.getItem("stories") || "[]");
}

function saveStories(stories) {
  localStorage.setItem("stories", JSON.stringify(stories));
}

let currentStory = null;

// =========================
// Local synonyms (hybrid base)
// =========================
const localSynonyms = {
  green: "verdant",
  nice: "pleasant",
  big: "immense",
  small: "minute",
  very: "extremely",
  sad: "melancholy",
  happy: "elated",
  pretty: "beautiful",
  bad: "poor",
  good: "excellent"
};

// =========================
// AI suggestion (fallback)
// =========================
// Replace YOUR_API_ENDPOINT_HERE if you want AI suggestions.
// If not, local synonyms still work perfectly.
async function getAISuggestion(text) {
  try {
    const response = await fetch("YOUR_API_ENDPOINT_HERE", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Rewrite this phrase to be more vivid and descriptive: "${text}"`,
        max_tokens: 20
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.suggestion || null;
  } catch (e) {
    return null;
  }
}

// =========================
// Load story into editor
// =========================
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
  scanForSuggestions();
}

// =========================
// Autosave
// =========================
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

// =========================
// Word count
// =========================
function updateWordCount() {
  const editor = document.getElementById("editor");
  const text = editor.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const wc = document.getElementById("wordCount");
  if (wc) wc.textContent = `${words} words`;
}

// =========================
// Suggestion scanner
// =========================
function scanForSuggestions() {
  const editor = document.getElementById("editor");
  if (!editor) return;

  let html = editor.innerHTML;

  // Remove old suggestion spans
  html = html.replace(/<span class="suggestion"[^>]*>(.*?)<\/span>/gi, "$1");

  // Add new suggestion spans for local synonyms
  Object.keys(localSynonyms).forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    html = html.replace(regex, (match) => {
      const suggestion = localSynonyms[word] || match;
      return `<span class="suggestion" data-suggestion="${suggestion}">${match}</span>`;
    });
  });

  editor.innerHTML = html;
}

// =========================
// Toolbar setup (top + floating)
// =========================
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
      scanForSuggestions();
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
      scanForSuggestions();
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
      scanForSuggestions();
    });
  }

  // Color picker
  const colorPicker = document.getElementById("colorPicker");
  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      document.execCommand("foreColor", false, e.target.value);
      editor.focus();
      scanForSuggestions();
    });
  }

  // Palette
  document.querySelectorAll("#colorPalette .swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-color");
      if (!color) return;
      document.execCommand("foreColor", false, color);
      editor.focus();
      scanForSuggestions();
    });
  });

  // Floating toolbar buttons
  document.querySelectorAll(".floating-toolbar .fbtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      if (!cmd) return;
      document.execCommand(cmd, false, null);
      editor.focus();
      scanForSuggestions();
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
      scanForSuggestions();
    });
  }

  // Floating color picker
  const floatColorPicker = document.getElementById("floatColorPicker");
  if (floatColorPicker) {
    floatColorPicker.addEventListener("input", (e) => {
      document.execCommand("foreColor", false, e.target.value);
      editor.focus();
      scanForSuggestions();
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
function placeCaretAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// =========================
// Floating toolbar behavior
// =========================
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
  // Clean RTL markers automatically
  const cleaned = stripRTL(editor.innerHTML);
  if (cleaned !== editor.innerHTML) {
    editor.innerHTML = cleaned;
    placeCaretAtEnd(editor); // keep cursor in correct place
  }

  hideBar();
  const status = document.getElementById("status");
  if (status) status.textContent = "Saving...";
  updateWordCount();

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    showBar();
  }, 600);

  scanForSuggestions();
});

    hideBar();
    const status = document.getElementById("status");
    if (status) status.textContent = "Saving...";
    updateWordCount();

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      showBar();
    }, 600);

    scanForSuggestions();
  });

  showBar();
}

// =========================
// Hover → AI upgrade
// =========================
document.addEventListener("mouseover", async (e) => {
  if (!e.target.classList.contains("suggestion")) return;

  const span = e.target;
  const original = span.innerText.trim();
  const currentSuggestion = span.getAttribute("data-suggestion") || original;

  if (currentSuggestion.toLowerCase() === original.toLowerCase()) {
    const ai = await getAISuggestion(original);
    if (ai) span.setAttribute("data-suggestion", ai);
  }
});

// =========================
// Click to apply suggestion
// =========================
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("suggestion")) return;

  const span = e.target;
  const suggestion = span.getAttribute("data-suggestion") || span.innerText;
  span.outerHTML = suggestion;
});

// =========================
// Intro modal support
// =========================
function setupIntroModal() {
  const modal = document.getElementById("introModal");
  if (!modal) return;

  const hasSeenIntro = localStorage.getItem("seenIntro");

  if (!hasSeenIntro) {
    modal.classList.remove("hidden");
  }

  const slides = [
    document.getElementById("introSlide1"),
    document.getElementById("introSlide2"),
    document.getElementById("introSlide3")
  ];

  let current = 0;

  function showSlide(i) {
    slides.forEach((s, idx) => {
      s.classList.toggle("hidden", idx !== i);
    });
  }

  document.querySelectorAll(".intro-next").forEach(btn => {
    btn.addEventListener("click", () => {
      current++;
      if (current >= slides.length) {
        modal.classList.add("hidden");
        localStorage.setItem("seenIntro", "true");
      } else {
        showSlide(current);
      }
    });
  });

  const closeBtn = document.getElementById("introClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      localStorage.setItem("seenIntro", "true");
    });
  }
}
// =========================
// Fix hidden RTL markers
// =========================
function stripRTL(text) {
  if (!text) return text;

  // Remove Unicode RTL/LTR control characters
  return text.replace(/[\u202A\u202B\u202D\u202E\u202C\u2066\u2067\u2068\u2069]/g, "");
}

// =========================
// Init
// =========================
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  loadTheme();
  loadStory();
  setupToolbar();
  setupFloatingToolbarBehavior();
  updateWordCount();
  scanForSuggestions();
  setupIntroModal();
});
