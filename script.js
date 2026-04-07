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
  const select = document.getElementById("themeSelect");
  if (select) select.value = saved;
}

function changeTheme() {
  const theme = document.getElementById("themeSelect").value;
  document.body.className = theme;
  localStorage.setItem("storyTheme", theme);
}

// STORAGE
function loadStories() {
  return JSON.parse(localStorage.getItem("stories") || "[]");
}

function saveStories(stories) {
  localStorage.setItem("stories", JSON.stringify(stories));
}

// RENDER LIST
function renderStories() {
  const list = document.getElementById("storiesList");
  const stories = loadStories();

  list.innerHTML = "";

  if (stories.length === 0) {
    list.innerHTML = `<p class="empty">No stories yet. Click “New story” to begin.</p>`;
    return;
  }

  stories
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach(story => {
      const item = document.createElement("article");
      item.className = "story-card";
      item.innerHTML = `
        <div class="story-main">
          <h3>${story.title || "Untitled story"}</h3>
          <p class="story-snippet">${(story.plainText || "").slice(0, 120) || "No content yet."}</p>
        </div>
        <div class="story-meta">
          <span class="timestamp">${new Date(story.updatedAt).toLocaleString()}</span>
          <div class="story-actions">
            <button class="btn small primary open-btn" data-id="${story.id}">Open</button>
            <button class="btn small ghost delete-btn" data-id="${story.id}">Delete</button>
          </div>
        </div>
      `;

      item.querySelector(".open-btn").addEventListener("click", () => {
        window.location.href = `story.html?id=${encodeURIComponent(story.id)}`;
      });

      item.querySelector(".delete-btn").addEventListener("click", () => {
        deleteStory(story.id);
      });

      list.appendChild(item);
    });
}

// CREATE STORY
function createNewStory() {
  const stories = loadStories();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newStory = {
    id,
    title: "Untitled story",
    content: "",
    plainText: "",
    createdAt: now,
    updatedAt: now
  };

  stories.push(newStory);
  saveStories(stories);
  window.location.href = `story.html?id=${encodeURIComponent(id)}`;
}

// DELETE STORY
function deleteStory(id) {
  if (!confirm("Delete this story?")) return;
  let stories = loadStories();
  stories = stories.filter(s => s.id !== id);
  saveStories(stories);
  renderStories();
}

// BACKUP / IMPORT
function downloadBackup() {
  const data = localStorage.getItem("stories") || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "stories-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const stories = JSON.parse(reader.result);
      if (!Array.isArray(stories)) throw new Error();
      saveStories(stories);
      renderStories();
    } catch {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  loadTheme();
  renderStories();

  document.getElementById("newStoryBtn").addEventListener("click", createNewStory);
  document.getElementById("backupBtn").addEventListener("click", downloadBackup);
  document.getElementById("importBtn").addEventListener("click", () =>
    document.getElementById("importFile").click()
  );
  document.getElementById("importFile").addEventListener("change", importBackup);
  document.getElementById("themeSelect").addEventListener("change", changeTheme);
});
