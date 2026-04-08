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
  const select = document.getElementById("themeSelect");
  if (select) select.value = saved;
}

function setupThemeSwitcher() {
  const select = document.getElementById("themeSelect");
  if (!select) return;
  select.addEventListener("change", () => {
    const value = select.value || "theme-pastel";
    document.body.className = value;
    localStorage.setItem("storyTheme", value);
  });
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

// =========================
// Render stories
// =========================
function renderStories() {
  const container = document.getElementById("storiesList");
  if (!container) return;

  const stories = loadStories();
  container.innerHTML = "";

  if (!stories.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No stories yet. Create your first one!";
    container.appendChild(empty);
    return;
  }

  stories
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .forEach((story) => {
      const card = document.createElement("div");
      card.className = "story-card";

      const title = document.createElement("h3");
      title.textContent = story.title || "Untitled story";

      const snippet = document.createElement("p");
      snippet.className = "story-snippet";
      snippet.textContent = (story.plainText || "").slice(0, 120) || "No content yet.";

      const meta = document.createElement("div");
      meta.className = "story-meta";

      const date = document.createElement("span");
      const d = new Date(story.updatedAt || story.createdAt);
      date.textContent = isNaN(d) ? "" : d.toLocaleString();

      const actions = document.createElement("div");
      actions.className = "story-actions";

      const openBtn = document.createElement("button");
      openBtn.className = "btn ghost small";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", () => {
        window.location.href = `story.html?id=${encodeURIComponent(story.id)}`;
      });

      const renameBtn = document.createElement("button");
      renameBtn.className = "btn ghost small";
      renameBtn.textContent = "Rename";
      renameBtn.addEventListener("click", () => {
        const newTitle = prompt("New title:", story.title || "Untitled story");
        if (newTitle === null) return;
        story.title = newTitle.trim() || "Untitled story";
        saveStories(stories);
        renderStories();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn ghost small";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (!confirm("Delete this story?")) return;
        const filtered = stories.filter((s) => s.id !== story.id);
        saveStories(filtered);
        renderStories();
      });

      actions.appendChild(openBtn);
      actions.appendChild(renameBtn);
      actions.appendChild(deleteBtn);

      meta.appendChild(date);
      meta.appendChild(actions);

      card.appendChild(title);
      card.appendChild(snippet);
      card.appendChild(meta);

      container.appendChild(card);
    });
}

// =========================
// New story
// =========================
function setupNewStoryButton() {
  const btn = document.getElementById("newStoryBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const stories = loadStories();
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const now = new Date().toISOString();

    const story = {
      id,
      title: "Untitled story",
      content: "",
      plainText: "",
      createdAt: now,
      updatedAt: now
    };

    stories.push(story);
    saveStories(stories);
    window.location.href = `story.html?id=${encodeURIComponent(id)}`;
  });
}

// =========================
// Backup / Import
// =========================
function setupBackupImport() {
  const backupBtn = document.getElementById("backupBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");

  // Backup
  if (backupBtn) {
    backupBtn.addEventListener("click", () => {
      const stories = loadStories();
      const blob = new Blob([JSON.stringify(stories, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "story-studio-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Import
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());

    importFile.addEventListener("change", () => {
      const file = importFile.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!Array.isArray(data)) throw new Error("Invalid backup format");

          saveStories(data);
          renderStories();
          alert("Backup imported successfully.");
        } catch (e) {
          alert("Could not import backup.");
        }
      };

      reader.readAsText(file);
    });
  }
}

// =========================
// Intro modal (first-time only)
// =========================
function setupIntroModal() {
  const modal = document.getElementById("introModal");
  if (!modal) return;

  const slide1 = document.getElementById("introSlide1");
  const slide2 = document.getElementById("introSlide2");
  const slide3 = document.getElementById("introSlide3");
  const closeBtn = document.getElementById("introClose");

  if (!slide1 || !slide2 || !slide3 || !closeBtn) return;

  const hasSeenIntro = localStorage.getItem("seenIntro");

  if (!hasSeenIntro) {
    modal.classList.remove("hidden");
  }

  const slides = [slide1, slide2, slide3];
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

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    localStorage.setItem("seenIntro", "true");
  });
}

// =========================
// Init
// =========================
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  loadTheme();
  setupThemeSwitcher();
  setupNewStoryButton();
  setupBackupImport();
  renderStories();
  setupIntroModal();
});

