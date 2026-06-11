const CONFIG = {
  // Paste your deployed Google Apps Script Web App URL here.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwRxNAGg1SWenom3ESKkotRDoVBAcukmRsnMkgwsYIpuH62yiR3PDKf9RBPh71SOozt/exec",
  PLAYER_SLOTS: 10
};

let state = {
  players: [],
  predictions: [],
  results: [],
  fixtures: [],
  selectedPlayerId: null
};

document.addEventListener("DOMContentLoaded", async () => {
  buildPlayerTabs();
  bindEvents();
  await loadData();
  showHome();
});

function bindEvents() {
  document.getElementById("refreshBtn").addEventListener("click", loadData);
  document.getElementById("homeBtn").addEventListener("click", showHome);
  document.getElementById("saveNameBtn").addEventListener("click", savePlayerName);
  document.getElementById("historyBtn").addEventListener("click", toggleHistory);
  document.getElementById("helpBtn").addEventListener("click", openHelpModal);
  document.getElementById("closeHelpBtn").addEventListener("click", closeHelpModal);
  document.getElementById("helpModal").addEventListener("click", event => {
    if (event.target.id === "helpModal") closeHelpModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeHelpModal();
  });
}

async function loadData() {
  try {
    if (CONFIG.APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
      state.players = defaultPlayers();
      state.predictions = [];
      state.results = [];
      state.fixtures = demoFixtures();
      renderAll();
      showToast("Demo mode: add your Apps Script URL in script.js");
      return;
    }

    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const data = await res.json();

    state.players = data.players?.length ? data.players : defaultPlayers();
    state.predictions = data.predictions || [];
    state.results = data.results || [];
    state.fixtures = data.fixtures || [];

    renderAll();
    showToast("Data refreshed");
  } catch (err) {
    console.error(err);
    state.players = defaultPlayers();
    state.fixtures = demoFixtures();
    renderAll();
    showToast("Could not load Sheet data", true);
  }
}

function defaultPlayers() {
  return Array.from({ length: CONFIG.PLAYER_SLOTS }, (_, index) => ({
    playerId: `player${index + 1}`,
    displayName: `Loading...`
  }));
}

function demoFixtures() {
  return [
    {
      gameId: "wc2026-001",
      kickoff: "2026-06-11T12:00:00-07:00",
      home: "Mexico",
      away: "TBD",
      stage: "Group Stage",
      venue: "Estadio Azteca"
    },
    {
      gameId: "wc2026-002",
      kickoff: "2026-06-12T12:00:00-07:00",
      home: "Canada",
      away: "TBD",
      stage: "Group Stage",
      venue: "Toronto"
    },
    {
      gameId: "wc2026-003",
      kickoff: "2026-06-12T18:00:00-04:00",
      home: "United States",
      away: "TBD",
      stage: "Group Stage",
      venue: "Los Angeles"
    }
  ];
}

function buildPlayerTabs() {
  const tabs = document.getElementById("playerTabs");
  tabs.innerHTML = "";

  for (let i = 1; i <= CONFIG.PLAYER_SLOTS; i++) {
    const button = document.createElement("button");
    button.className = "player-tab";
    button.dataset.playerId = `player${i}`;
    button.textContent = `⏳ Loading...`;
    button.addEventListener("click", () => selectPlayer(`player${i}`));
    tabs.appendChild(button);
  }
}

function renderAll() {
  renderPlayerTabs();
  renderScoreboard();
  renderSelectedPlayer();
}

function showHome() {
  state.selectedPlayerId = null;
  document.querySelector(".scoreboard-card").classList.remove("hidden");
  document.getElementById("playerPanel").classList.add("hidden");
  renderPlayerTabs();
  renderScoreboard();
}

function openHelpModal() {
  document.getElementById("helpModal").classList.remove("hidden");
}

function closeHelpModal() {
  document.getElementById("helpModal").classList.add("hidden");
}


function renderPlayerTabs() {
  document.querySelectorAll(".player-tab").forEach(tab => {
    const player = getPlayer(tab.dataset.playerId);
    tab.textContent = player.displayName;
    tab.classList.toggle("active", tab.dataset.playerId === state.selectedPlayerId);
  });
}

function renderScoreboard() {
  const scoreboard = document.getElementById("scoreboard");
  const rows = state.players
    .map(player => ({
      ...player,
      points: calculateTotalPoints(player.playerId)
    }))
    .sort((a, b) => b.points - a.points);

  scoreboard.innerHTML = rows.map((row, index) => `
    <div class="score-row">
      <div class="rank">${index + 1}</div>
      ${renderAvatar(row)}
      <div>${escapeHtml(row.displayName)}</div>
      <div class="points">${row.points} pts</div>
    </div>
  `).join("");
}

function selectPlayer(playerId) {
  state.selectedPlayerId = playerId;
  document.querySelector(".scoreboard-card").classList.add("hidden");
  document.getElementById("playerPanel").classList.remove("hidden");
  renderAll();
}

function renderSelectedPlayer() {
  if (!state.selectedPlayerId) return;

  const player = getPlayer(state.selectedPlayerId);
  document.getElementById("selectedPlayerTitle").textContent = player.displayName;
  document.getElementById("playerNameInput").value =
    player.displayName.startsWith("Player ") ? "" : player.displayName;

  renderGames();
  renderHistory();
}

function renderGames() {
  const gamesList = document.getElementById("gamesList");
  const now = new Date();

  const upcomingGames = state.fixtures
    .filter(game => new Date(game.kickoff) > now)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

  if (!upcomingGames.length) {
    gamesList.innerHTML = `<p class="muted">No upcoming games available for prediction.</p>`;
    return;
  }

  gamesList.innerHTML = upcomingGames.map(game => {
    const prediction = getPrediction(state.selectedPlayerId, game.gameId);
    const kickoff = new Date(game.kickoff);
    const locked = now >= kickoff;

    return `
      <div class="game-card ${locked ? "locked" : ""}">
        <div>
          <div class="teams">
  ${FLAGS[game.home] || "🏳️"} ${escapeHtml(game.home)}
  vs
  ${FLAGS[game.away] || "🏳️"} ${escapeHtml(game.away)}
</div>
          <div class="game-meta">${escapeHtml(game.stage || "")} · ${formatDate(kickoff)} · ${escapeHtml(game.venue || "")}</div>
        </div>

        <div class="score-inputs">
          <input id="${game.gameId}-home" type="number" min="0" value="${prediction?.predictedHome ?? ""}" ${locked ? "disabled" : ""} />
          <span>-</span>
          <input id="${game.gameId}-away" type="number" min="0" value="${prediction?.predictedAway ?? ""}" ${locked ? "disabled" : ""} />
        </div>

        <button onclick="savePrediction('${game.gameId}')" ${locked ? "disabled" : ""}>
          ${prediction ? "Update" : "Submit"}
        </button>
      </div>
    `;
  }).join("");
}

async function savePlayerName() {
  const input = document.getElementById("playerNameInput");
  const displayName = input.value.trim();
  const avatar = getPlayer(state.selectedPlayerId).avatar || "";

  if (!displayName) {
    showToast("Add a player name first", true);
    return;
  }

  try {
    await postToSheet({
      action: "savePlayer",
      playerId: state.selectedPlayerId,
      displayName,
      avatar
    });

    const existing = state.players.find(p => p.playerId === state.selectedPlayerId);
    if (existing) {
      existing.displayName = displayName;
      existing.avatar = avatar;
    }

    renderAll();
    showToast("Player name saved");
  } catch (err) {
    showToast(err.message || "Could not save player", true);
  }
}

async function savePrediction(gameId) {
  const game = state.fixtures.find(g => g.gameId === gameId);
  if (!game) return;

  if (new Date() >= new Date(game.kickoff)) {
    showToast("Prediction locked. Game already started.", true);
    renderGames();
    return;
  }

  const homeValue = document.getElementById(`${gameId}-home`).value;
  const awayValue = document.getElementById(`${gameId}-away`).value;

  if (homeValue === "" || awayValue === "") {
    showToast("Enter both scores", true);
    return;
  }

  const predictedHome = Number(homeValue);
  const predictedAway = Number(awayValue);

  try {
    await postToSheet({
      action: "savePrediction",
      playerId: state.selectedPlayerId,
      gameId,
      predictedHome,
      predictedAway
    });

    const existingIndex = state.predictions.findIndex(
      p => p.playerId === state.selectedPlayerId && p.gameId === gameId
    );

    const row = {
      playerId: state.selectedPlayerId,
      gameId,
      predictedHome,
      predictedAway,
      submittedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) state.predictions[existingIndex] = row;
    else state.predictions.push(row);

    renderGames();
    showToast("Prediction saved");
  } catch (err) {
    showToast(err.message || "Could not save prediction", true);
  }
}

async function postToSheet(payload) {
  if (CONFIG.APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    console.log("Demo POST", payload);
    return;
  }

  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to save");
  }
}

function toggleHistory() {
  document.getElementById("historyPanel").classList.toggle("hidden");
}

function renderHistory() {
  const panel = document.getElementById("historyPanel");
  const playerPredictions = state.predictions
    .filter(p => p.playerId === state.selectedPlayerId)
    .sort((a, b) => {
      const gameA = state.fixtures.find(g => g.gameId === a.gameId);
      const gameB = state.fixtures.find(g => g.gameId === b.gameId);
      return new Date(gameA?.kickoff || 0) - new Date(gameB?.kickoff || 0);
    });

  if (!playerPredictions.length) {
    panel.innerHTML = `<p class="muted">No predictions submitted yet.</p>`;
    return;
  }

  panel.innerHTML = playerPredictions.map(prediction => {
    const game = state.fixtures.find(g => g.gameId === prediction.gameId);
    const result = getResult(prediction.gameId);
    const points = result ? calculatePoints(prediction, result) : null;

    return `
      <div class="history-row">
        <div>
          <strong>${escapeHtml(game?.home || "Unknown")} vs ${escapeHtml(game?.away || "Unknown")}</strong>
          <div class="muted">Prediction: ${prediction.predictedHome}-${prediction.predictedAway}</div>
          ${result ? `<div class="muted">Actual: ${result.actualHome}-${result.actualAway}</div>` : ""}
        </div>
        <div class="points">${points === null ? "Pending" : `${points} pts`}</div>
      </div>
    `;
  }).join("");
}

function calculateTotalPoints(playerId) {
  return state.predictions
    .filter(p => p.playerId === playerId)
    .reduce((sum, prediction) => {
      const result = getResult(prediction.gameId);
      return sum + (result ? calculatePoints(prediction, result) : 0);
    }, 0);
}

function calculatePoints(prediction, result) {
  const ph = Number(prediction.predictedHome);
  const pa = Number(prediction.predictedAway);
  const ah = Number(result.actualHome);
  const aa = Number(result.actualAway);

  if (ph === ah && pa === aa) return 3;

  const predictedDiff = ph - pa;
  const actualDiff = ah - aa;
  if (predictedDiff === actualDiff) return 2;

  const predictedOutcome = Math.sign(predictedDiff);
  const actualOutcome = Math.sign(actualDiff);
  if (predictedOutcome === actualOutcome) return 1;

  return 0;
}

function renderAvatar(player) {
  if (player.avatar) {
    const src = `images/${encodeURIComponent(player.avatar)}`;
    return `<img class="avatar" src="${src}" alt="${escapeHtml(player.displayName)} avatar" onerror="this.outerHTML='<div class=&quot;avatar-placeholder&quot;>${getInitials(player.displayName)}</div>'" />`;
  }

  return `<div class="avatar-placeholder">${getInitials(player.displayName)}</div>`;
}

function getInitials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "?";
}

function getPlayer(playerId) {
  return state.players.find(p => p.playerId === playerId) || {
    playerId,
    displayName: playerId.replace("player", "Player ")
  };
}

function getPrediction(playerId, gameId) {
  return state.predictions.find(p => p.playerId === playerId && p.gameId === gameId);
}

function getResult(gameId) {
  return state.results.find(r => r.gameId === gameId);
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.remove("hidden");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.add("hidden"), 3200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
