/**
 * @typedef {import('../shared/types.js').GameStatus} GameStatus
 * @typedef {import('../shared/types.js').PlayerSymbol} PlayerSymbol
 * @typedef {import('../shared/types.js').CellValue} CellValue
 * @typedef {import('../shared/types.js').GameData} GameData
 */

/** @type {any} */
let socket;
/** @type {GameData | null} */
let currentGame = null;
/** @type {PlayerSymbol | null} */
let mySymbol = null;
/** @type {string | null} */
let roomCode = null;

const roomControls = document.getElementById("roomControls");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCodeInput = document.getElementById("roomCodeInput");
const gameInfo = document.getElementById("gameInfo");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const playerSymbol = document.getElementById("playerSymbol");
const statusMessage = document.getElementById("statusMessage");
const gameBoard = document.getElementById("gameBoard");
const cells = document.querySelectorAll(".Cell");

function initSocket() {
  socket = io();

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on(
    "room-created",
    (/** @type {{ roomCode: string, game: GameData }} */ data) => {
      console.log("Room created:", data);
      roomCode = data.roomCode;
      currentGame = data.game;
      mySymbol = "X";
      showGame();
    }
  );

  socket.on("game-joined", (/** @type {{ game: GameData }} */ data) => {
    console.log("Game joined:", data);
    currentGame = data.game;

    if (currentGame.player1SocketId === socket.id) {
      mySymbol = "X";
    } else {
      mySymbol = "O";
    }
    showGame();
  });

  socket.on("game-update", (/** @type {{ game: GameData }} */ data) => {
    console.log("Game update:", data);
    currentGame = data.game;
    updateBoard();
    updateStatus();
  });

  socket.on(
    "game-over",
    (/** @type {{ game: GameData, winner: string }} */ data) => {
      console.log("Game over:", data);
      currentGame = data.game;
      updateBoard();
      showGameOver(data.winner);
    }
  );

  socket.on("error", (/** @type {{ message: string }} */ data) => {
    alert("Error: " + data.message);
  });
}

function showGame() {
  roomControls.classList.add("hidden");
  gameInfo.classList.remove("hidden");
  gameBoard.classList.remove("hidden");

  roomCodeDisplay.textContent = roomCode;
  playerSymbol.textContent = mySymbol;

  updateBoard();
  updateStatus();
}

function updateBoard() {
  if (!currentGame) return;

  cells.forEach((cell, index) => {
    const value = currentGame.boardState[index];
    cell.textContent = value || "";

    if (value === "T") {
      cell.classList.add("t-cell");
    } else {
      cell.classList.remove("t-cell");
    }

    if (value || currentGame.status !== "active") {
      cell.disabled = true;
    } else {
      cell.disabled = false;
    }
  });
}

function updateStatus() {
  if (!currentGame) return;

  if (currentGame.status === "waiting") {
    statusMessage.textContent = "Waiting for opponent...";
    statusMessage.style.color = "#FF9800";
  } else if (currentGame.status === "active") {
    const isMyTurn = currentGame.currentPlayer === mySymbol;
    if (isMyTurn) {
      statusMessage.textContent = "Your turn!";
      statusMessage.style.color = "#4CAF50";
    } else {
      statusMessage.textContent = "Opponent's turn...";
      statusMessage.style.color = "#FF9800";
    }
  }
}

function showGameOver(winner) {
  if (winner === "draw") {
    statusMessage.textContent = "It's a draw!";
    statusMessage.style.color = "#9E9E9E";
  } else if (winner === mySymbol) {
    statusMessage.textContent = "You won!";
    statusMessage.style.color = "#4CAF50";
  } else {
    statusMessage.textContent = "You lost!";
    statusMessage.style.color = "#F44336";
  }
}

createRoomBtn.addEventListener("click", () => {
  socket.emit("create-room");
});

joinRoomBtn.addEventListener("click", () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  if (code.length !== 6) {
    alert("Please enter a valid 6-character room code");
    return;
  }
  roomCode = code;
  socket.emit("join-room", { roomCode: code });
});

roomCodeInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.toUpperCase();
});

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!currentGame || currentGame.status !== "active") return;
    if (currentGame.currentPlayer !== mySymbol) return;

    const position = parseInt(cell.dataset.index);
    socket.emit("make-move", { roomCode, position });
  });
});

initSocket();
