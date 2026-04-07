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
  renderStories();

  document.getElementById("newStoryBtn").addEventListener("click", createNewStory);
  document.getElementById("backupBtn").addEventListener("click", downloadBackup);
  document.getElementById("importBtn").addEventListener("click", () =>
    document.getElementById("importFile").click()
  );
  document.getElementById("importFile").addEventListener("change", importBackup);
  document.getElementById("themeSelect").addEventListener("change", changeTheme);
});

// ----------------------
// THEME SYSTEM
// ----------------------
function loadTheme() {
  const saved = localStorage.getItem("storyTheme") || "theme-minimal";
  document.body.className = saved;
  document.getElementById("themeSelect").value = saved;
}

function changeTheme() {
  const theme = document.getElementById("themeSelect").value;
  document.body.className = theme;
  localStorage.setItem("storyTheme", theme);
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
// RENDER STORY LIST
// ----------------------
function renderStories() {
  const list = document.getElementById("storiesList");
  const stories = loadStories();

  list.innerHTML = "";

  if (stories.length === 0) {
    list.innerHTML = "<p>No stories yet.</p>";
    return;
  }

  stories.forEach(story => {
    const item = document.createElement("div");
    item.className = "story-item";
    item.innerHTML = `
      <h3>${story.title}</h3>
      <p>${new Date(story.updatedAt).toLocaleString()}</p>
      <button data-id="${story.id}" class="open-btn">Open</button>
      <button data-id="${story.id}" class="delete-btn">Delete</button>
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

// ----------------------
// CREATE NEW STORY
// ----------------------
function createNewStory() {
  const stories = loadStories();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newStory = {
    id,
    title: "Untitled story",
    content: "",
    createdAt: now,
    updatedAt: now
  };

  stories.push(newStory);
  saveStories(stories);

  window.location.href = `story.html?id=${encodeURIComponent(id)}`;
}

// ----------------------
// DELETE STORY
// ----------------------
function deleteStory(id) {
  let stories = loadStories();
  stories = stories.filter(s => s.id !== id);
  saveStories(stories);
  renderStories();
}

// ----------------------
// BACKUP / IMPORT
// ----------------------
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
      saveStories(stories);
      renderStories();
    } catch {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}
