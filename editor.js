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
  const index = stories.findIndex((s) => s.id === currentStory.id
