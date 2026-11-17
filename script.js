(() => {
  "use strict";

  const STORAGE_KEY = "little-victories-tic-tac-toe";
  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const CELL_NAMES = [
    "Top left", "Top center", "Top right",
    "Middle left", "Center", "Middle right",
    "Bottom left", "Bottom center", "Bottom right"
  ];
  const DEFAULT_SETTINGS = {
    mode: "computer",
    difficulty: "medium",
    humanMark: "X",
    names: { X: "Player X", O: "Computer" },
    scores: { X: 0, O: 0, draws: 0 },
    theme: null,
    sound: false
  };

  const elements = {
    board: document.querySelector("#game-board"),
    cells: Array.from(document.querySelectorAll(".cell")),
    gameStatus: document.querySelector("#game-status"),
    boardTitle: document.querySelector("#board-title"),
    turnName: document.querySelector("#turn-name"),
    turnBadge: document.querySelector("#turn-badge"),
    roundNumber: document.querySelector("#round-number"),
    mode: document.querySelector("#game-mode"),
    difficulty: document.querySelector("#difficulty"),
    difficultyField: document.querySelector("#difficulty-field"),
    humanMark: document.querySelector("#human-mark"),
    symbolField: document.querySelector("#symbol-field"),
    nameX: document.querySelector("#name-x"),
    nameO: document.querySelector("#name-o"),
    nameXLabel: document.querySelector("#name-x-label"),
    nameOLabel: document.querySelector("#name-o-label"),
    scoreNameX: document.querySelector("#score-name-x"),
    scoreNameO: document.querySelector("#score-name-o"),
    scoreX: document.querySelector("#score-x"),
    scoreO: document.querySelector("#score-o"),
    scoreDraw: document.querySelector("#score-draw"),
    resultMessage: document.querySelector("#result-message"),
    resultText: document.querySelector("#result-text"),
    resultIcon: document.querySelector("#result-icon"),
    sparkles: document.querySelector("#win-sparkles"),
    newRound: document.querySelector("#new-round"),
    resetScores: document.querySelector("#reset-scores"),
    themeToggle: document.querySelector("#theme-toggle"),
    themeIcon: document.querySelector(".theme-icon"),
    themeColor: document.querySelector('meta[name="theme-color"]'),
    soundToggle: document.querySelector("#sound-toggle"),
    soundIcon: document.querySelector("#sound-icon"),
    soundLabel: document.querySelector("#sound-label")
  };

  const settings = loadSettings();
  const state = {
    board: Array(9).fill(""),
    current: "X",
    finished: false,
    thinking: false,
    winningCells: [],
    round: 1,
    focusedCell: 0,
    computerTimer: null
  };
  let audioContext = null;
  let audioReady = false;

  function loadSettings() {
    const saved = safeRead();
    if (!saved || typeof saved !== "object") return { ...DEFAULT_SETTINGS, names: { ...DEFAULT_SETTINGS.names }, scores: { ...DEFAULT_SETTINGS.scores } };

    const settingsFromStorage = {
      mode: ["computer", "local"].includes(saved.mode) ? saved.mode : DEFAULT_SETTINGS.mode,
      difficulty: ["easy", "medium", "hard"].includes(saved.difficulty) ? saved.difficulty : DEFAULT_SETTINGS.difficulty,
      humanMark: ["X", "O"].includes(saved.humanMark) ? saved.humanMark : DEFAULT_SETTINGS.humanMark,
      names: {
        X: cleanName(saved.names && saved.names.X, DEFAULT_SETTINGS.names.X),
        O: cleanName(saved.names && saved.names.O, DEFAULT_SETTINGS.names.O)
      },
      scores: {
        X: cleanScore(saved.scores && saved.scores.X),
        O: cleanScore(saved.scores && saved.scores.O),
        draws: cleanScore(saved.scores && saved.scores.draws)
      },
      theme: ["light", "dark"].includes(saved.theme) ? saved.theme : null,
      sound: typeof saved.sound === "boolean" ? saved.sound : DEFAULT_SETTINGS.sound
    };
    return settingsFromStorage;
  }

  function safeRead() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  function persistSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The game remains playable when browser storage is disabled or full.
    }
  }

  function cleanName(value, fallback) {
    if (typeof value !== "string") return fallback;
    const name = value.trim().slice(0, 20);
    return name || fallback;
  }

  function cleanScore(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function applyInitialSettings() {
    elements.mode.value = settings.mode;
    elements.difficulty.value = settings.difficulty;
    elements.humanMark.value = settings.humanMark;
    elements.nameX.value = settings.names.X;
    elements.nameO.value = settings.names.O;
    const theme = settings.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(theme, false);
    updateSettingsVisibility();
    renderScores();
    updatePlayerNames();
    updateSoundButton();
  }

  function setTheme(theme, save = true) {
    document.documentElement.dataset.theme = theme;
    elements.themeColor.content = theme === "dark" ? "#171824" : "#f5f7fb";
    elements.themeIcon.textContent = theme === "dark" ? "☀" : "☾";
    const action = theme === "dark" ? "light" : "dark";
    elements.themeToggle.setAttribute("aria-label", `Switch to ${action} theme`);
    elements.themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    elements.themeToggle.title = `Switch to ${action} theme`;
    if (save) {
      settings.theme = theme;
      persistSettings();
    }
  }

  function updateSettingsVisibility() {
    const isComputerMode = settings.mode === "computer";
    elements.difficultyField.hidden = !isComputerMode;
    elements.symbolField.hidden = !isComputerMode;
    if (isComputerMode) {
      const computerMark = settings.humanMark === "X" ? "O" : "X";
      if (settings.names[computerMark] === `Player ${computerMark}`) settings.names[computerMark] = "Computer";
      if (settings.names[settings.humanMark] === "Computer") settings.names[settings.humanMark] = `Player ${settings.humanMark}`;
      elements.nameXLabel.textContent = settings.humanMark === "X" ? "Your name" : "Computer name";
      elements.nameOLabel.textContent = settings.humanMark === "O" ? "Your name" : "Computer name";
    } else {
      if (settings.names.X === "Computer") settings.names.X = "Player X";
      if (settings.names.O === "Computer") settings.names.O = "Player O";
      elements.nameXLabel.textContent = "Player X name";
      elements.nameOLabel.textContent = "Player O name";
    }
    elements.nameO.value = settings.names.O;
    elements.nameX.value = settings.names.X;
  }

  function updatePlayerNames() {
    elements.scoreNameX.textContent = settings.names.X;
    elements.scoreNameO.textContent = settings.names.O;
    elements.scoreX.setAttribute("aria-label", `${settings.names.X} wins`);
    elements.scoreO.setAttribute("aria-label", `${settings.names.O} wins`);
    if (!state.finished) renderTurn();
  }

  function renderScores() {
    elements.scoreX.textContent = String(settings.scores.X);
    elements.scoreO.textContent = String(settings.scores.O);
    elements.scoreDraw.textContent = String(settings.scores.draws);
  }

  function currentPlayerName(mark) {
    return settings.names[mark];
  }

  function isComputerTurn() {
    return settings.mode === "computer" && state.current !== settings.humanMark;
  }

  function renderTurn() {
    const mark = state.current;
    const playerName = currentPlayerName(mark);
    const computerTurn = isComputerTurn();
    const label = `${mark} · ${playerName}${computerTurn ? " is thinking…" : ""}`;
    elements.boardTitle.textContent = computerTurn ? "Computer’s turn" : `${playerName}’s turn`;
    elements.turnName.textContent = label;
    elements.turnBadge.classList.toggle("computer-turn", computerTurn);
    elements.gameStatus.textContent = computerTurn
      ? `${playerName} is choosing a move.`
      : `${playerName}, playing ${mark}, it is your turn.`;
  }

  function renderBoard() {
    elements.cells.forEach((cell, index) => {
      const mark = state.board[index];
      cell.textContent = mark;
      cell.classList.toggle("mark-X", mark === "X");
      cell.classList.toggle("mark-O", mark === "O");
      cell.classList.toggle("winning-cell", state.winningCells.includes(index));
      cell.setAttribute("aria-label", `${CELL_NAMES[index]}, ${mark ? `${mark}, ${currentPlayerName(mark)}` : "empty"}${state.winningCells.includes(index) ? ", winning square" : ""}`);
      cell.setAttribute("aria-disabled", String(Boolean(mark)));
      cell.tabIndex = index === state.focusedCell ? 0 : -1;
      cell.disabled = state.finished || state.thinking;
    });
  }

  function render() {
    renderBoard();
    renderScores();
    elements.roundNumber.textContent = String(state.round);
    if (!state.finished) renderTurn();
  }

  function findWinner(board) {
    for (const combination of WINNING_COMBINATIONS) {
      const [first, second, third] = combination;
      if (board[first] && board[first] === board[second] && board[first] === board[third]) {
        return { mark: board[first], cells: combination };
      }
    }
    return null;
  }

  function playMove(index) {
    if (state.finished || state.thinking || state.board[index] || isComputerTurn()) return;
    state.board[index] = state.current;
    playSound("move");
    const winner = findWinner(state.board);

    if (winner) {
      finishRound(winner.mark, winner.cells);
      return;
    }
    if (state.board.every(Boolean)) {
      finishRound(null, []);
      return;
    }

    state.current = state.current === "X" ? "O" : "X";
    render();
    if (isComputerTurn()) scheduleComputerMove();
  }

  function finishRound(winner, cells) {
    state.finished = true;
    state.winningCells = cells;
    if (winner) {
      settings.scores[winner] += 1;
      const winnerName = currentPlayerName(winner);
      elements.resultText.textContent = `${winnerName} wins this round!`;
      elements.resultIcon.textContent = "✦";
      elements.gameStatus.textContent = `Game over. ${winnerName}, playing ${winner}, wins this round.`;
      celebrate();
      playSound("win");
    } else {
      settings.scores.draws += 1;
      elements.resultText.textContent = "It’s a draw! Nicely played.";
      elements.resultIcon.textContent = "＝";
      elements.gameStatus.textContent = "Game over. The round is a draw.";
      playSound("draw");
    }
    elements.resultMessage.hidden = false;
    persistSettings();
    render();
  }

  function startNewRound() {
    if (state.computerTimer !== null) {
      window.clearTimeout(state.computerTimer);
      state.computerTimer = null;
    }
    state.board = Array(9).fill("");
    state.current = "X";
    state.finished = false;
    state.thinking = false;
    state.winningCells = [];
    state.round += 1;
    state.focusedCell = 0;
    elements.resultMessage.hidden = true;
    elements.sparkles.replaceChildren();
    render();
    if (isComputerTurn()) scheduleComputerMove();
  }

  function resetScores() {
    settings.scores = { X: 0, O: 0, draws: 0 };
    persistSettings();
    renderScores();
    elements.gameStatus.textContent = "All scores have been reset.";
  }

  function scheduleComputerMove() {
    state.thinking = true;
    render();
    state.computerTimer = window.setTimeout(() => {
      state.computerTimer = null;
      const index = chooseComputerMove(state.board, settings.difficulty, state.current);
      state.thinking = false;
      if (index >= 0) playComputerMove(index);
    }, 480);
  }

  function playComputerMove(index) {
    if (state.finished || state.board[index]) return;
    state.board[index] = state.current;
    playSound("move");
    const winner = findWinner(state.board);
    if (winner) {
      finishRound(winner.mark, winner.cells);
      return;
    }
    if (state.board.every(Boolean)) {
      finishRound(null, []);
      return;
    }
    state.current = state.current === "X" ? "O" : "X";
    render();
  }

  function chooseComputerMove(board, difficulty, computerMark) {
    const available = board.map((mark, index) => mark ? -1 : index).filter(index => index !== -1);
    if (difficulty === "easy" && Math.random() < 0.82) {
      return available[Math.floor(Math.random() * available.length)];
    }
    if (difficulty === "medium" && Math.random() < 0.42) {
      return available[Math.floor(Math.random() * available.length)];
    }
    return bestMove(board, computerMark);
  }

  function bestMove(board, computerMark) {
    let bestScore = -Infinity;
    let chosenIndex = -1;
    for (let index = 0; index < board.length; index += 1) {
      if (board[index]) continue;
      board[index] = computerMark;
      const score = minimax(board, false, computerMark, computerMark === "X" ? "O" : "X", 0);
      board[index] = "";
      if (score > bestScore) {
        bestScore = score;
        chosenIndex = index;
      }
    }
    return chosenIndex;
  }

  function minimax(board, maximizing, computerMark, humanMark, depth) {
    const winner = findWinner(board);
    if (winner) {
      if (winner.mark === computerMark) return 10 - depth;
      return depth - 10;
    }
    if (board.every(Boolean)) return 0;

    let bestScore = maximizing ? -Infinity : Infinity;
    const mark = maximizing ? computerMark : humanMark;
    for (let index = 0; index < board.length; index += 1) {
      if (board[index]) continue;
      board[index] = mark;
      const score = minimax(board, !maximizing, computerMark, humanMark, depth + 1);
      board[index] = "";
      bestScore = maximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
    }
    return bestScore;
  }

  function celebrate() {
    const colors = ["#7658e8", "#f2786b", "#3cae96", "#efb84c"];
    const fragments = document.createDocumentFragment();
    for (let index = 0; index < 18; index += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.setProperty("--sparkle-color", colors[index % colors.length]);
      sparkle.style.setProperty("--sparkle-x", `${Math.round(Math.random() * 260 - 130)}px`);
      sparkle.style.setProperty("--sparkle-y", `${Math.round(Math.random() * -150 - 20)}px`);
      fragments.append(sparkle);
    }
    elements.sparkles.replaceChildren(fragments);
    window.setTimeout(() => elements.sparkles.replaceChildren(), 800);
  }

  function updateSoundButton() {
    const label = settings.sound ? "Sound on" : "Sound off";
    elements.soundLabel.textContent = label;
    elements.soundIcon.textContent = settings.sound ? "♫" : "♪";
    elements.soundToggle.setAttribute("aria-label", settings.sound ? "Mute sounds" : "Turn sound on");
    elements.soundToggle.setAttribute("aria-pressed", String(settings.sound));
    elements.soundToggle.title = settings.sound ? "Mute sounds" : "Turn sound on";
  }

  function playSound(type) {
    if (!settings.sound || !audioReady || !audioContext) return;
    const frequencies = { move: 540, win: 760, draw: 360 };
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencies[type], now);
    if (type === "win") oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "move" ? 0.035 : 0.05, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "move" ? 0.09 : 0.24));
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + (type === "move" ? 0.1 : 0.25));
  }

  function enableAudio() {
    if (audioReady || !settings.sound) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    try {
      audioContext = new AudioContextConstructor();
      audioReady = true;
      audioContext.resume().catch(() => {
        audioReady = false;
      });
    } catch {
      audioContext = null;
      audioReady = false;
    }
  }

  function handleCellKeydown(event) {
    const directions = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0]
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const row = Math.floor(state.focusedCell / 3);
    const column = state.focusedCell % 3;
    const nextRow = (row + direction[0] + 3) % 3;
    const nextColumn = (column + direction[1] + 3) % 3;
    state.focusedCell = nextRow * 3 + nextColumn;
    renderBoard();
    elements.cells[state.focusedCell].focus();
  }

  elements.cells.forEach((cell, index) => {
    cell.addEventListener("click", () => playMove(index));
    cell.addEventListener("focus", () => {
      state.focusedCell = index;
      elements.cells.forEach((boardCell, cellIndex) => {
        boardCell.tabIndex = cellIndex === index ? 0 : -1;
      });
    });
    cell.addEventListener("keydown", handleCellKeydown);
  });

  elements.mode.addEventListener("change", () => {
    settings.mode = elements.mode.value;
    updateSettingsVisibility();
    persistSettings();
    updatePlayerNames();
    startNewRound();
  });

  elements.difficulty.addEventListener("change", () => {
    settings.difficulty = elements.difficulty.value;
    persistSettings();
  });

  elements.humanMark.addEventListener("change", () => {
    const previousMark = settings.humanMark;
    const nextMark = elements.humanMark.value;
    if (settings.mode === "computer" && previousMark !== nextMark) {
      const previousComputerMark = previousMark === "X" ? "O" : "X";
      const humanName = settings.names[previousMark];
      const computerName = settings.names[previousComputerMark];
      settings.names[nextMark] = humanName === `Player ${previousMark}` ? `Player ${nextMark}` : humanName;
      settings.names[previousMark] = computerName;
    }
    settings.humanMark = nextMark;
    updateSettingsVisibility();
    persistSettings();
    updatePlayerNames();
    startNewRound();
  });

  elements.nameX.addEventListener("input", () => {
    settings.names.X = cleanName(elements.nameX.value, "Player X");
    persistSettings();
    updatePlayerNames();
    renderBoard();
  });

  elements.nameO.addEventListener("input", () => {
    settings.names.O = cleanName(elements.nameO.value, settings.mode === "computer" ? "Computer" : "Player O");
    persistSettings();
    updatePlayerNames();
    renderBoard();
  });

  elements.newRound.addEventListener("click", startNewRound);
  elements.resetScores.addEventListener("click", resetScores);
  elements.themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  elements.soundToggle.addEventListener("click", () => {
    settings.sound = !settings.sound;
    if (settings.sound) enableAudio();
    persistSettings();
    updateSoundButton();
    playSound("move");
  });

  document.addEventListener("pointerdown", enableAudio, { once: true });
  document.addEventListener("keydown", enableAudio, { once: true });

  applyInitialSettings();
  render();
  if (isComputerTurn()) scheduleComputerMove();
})();
