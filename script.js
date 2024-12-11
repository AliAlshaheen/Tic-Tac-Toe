const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficultySelect");
const themeSwitch = document.getElementById("themeSwitch");
const body = document.querySelector("body");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let difficulty = "easy"; // default

// Event Listeners
cells.forEach((cell) => cell.addEventListener("click", cellClicked));
resetBtn.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", (e) => {
  difficulty = e.target.value;
  resetGame();
});
themeSwitch.addEventListener("change", toggleTheme);

// Initial setup
renderBoard();
updateStatusText();

function cellClicked() {
  const cellIndex = this.getAttribute("data-index");
  if (board[cellIndex] !== "" || !gameActive) {
    return;
  }
  // Player move
  makeMove(cellIndex, currentPlayer);
  if (!checkGameOver()) {
    // AI move after slight delay for realism
    setTimeout(() => {
      aiMove(difficulty);
      checkGameOver();
    }, 500);
  }
}

function makeMove(index, player) {
  board[index] = player;
  renderBoard();
  updateStatusText();
}

function renderBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
  });
}

function updateStatusText() {
  if (!gameActive) {
    return;
  }
  statusText.textContent = `Current Player: ${currentPlayer}`;
}

function checkGameOver() {
  let winner = checkWin(board);
  if (winner) {
    gameActive = false;
    statusText.textContent =
      winner === "Tie" ? "It's a Tie!" : `Player ${winner} Wins!`;
    return true;
  }
  return false;
}

function checkWin(currentBoard) {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return currentBoard[a];
    }
  }

  // Check if tie
  if (!currentBoard.includes("")) {
    return "Tie";
  }
  return null;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  renderBoard();
  updateStatusText();
}

function aiMove(level) {
  if (!gameActive) return;

  let bestMove;
  switch (level) {
    case "easy":
      bestMove = getRandomMove(board);
      break;
    case "medium":
      bestMove = getMediumMove(board);
      break;
    case "hard":
      bestMove = getBestMove(board, "O").index;
      break;
  }

  if (bestMove !== undefined && board[bestMove] === "") {
    makeMove(bestMove, "O");
  }
}

// Easy: Random move
function getRandomMove(currentBoard) {
  const available = currentBoard
    .map((val, i) => (val === "" ? i : null))
    .filter((i) => i !== null);
  return available[Math.floor(Math.random() * available.length)];
}

// Medium: Try to win or block
function getMediumMove(currentBoard) {
  // 1. Try to win
  let move = findBestMoveForPlayer(currentBoard, "O");
  if (move !== null) return move;
  // 2. Block player X
  move = findBestMoveForPlayer(currentBoard, "X");
  if (move !== null) return move;
  // Else random
  return getRandomMove(currentBoard);
}

function findBestMoveForPlayer(currentBoard, player) {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    let line = [currentBoard[a], currentBoard[b], currentBoard[c]];
    // If two are player and one is empty -> win/block move
    if (
      line.filter((val) => val === player).length === 2 &&
      line.includes("")
    ) {
      return [a, b, c].find((i) => currentBoard[i] === "");
    }
  }
  return null;
}

// Advanced (Hard) using minimax
function getBestMove(newBoard, player) {
  let availSpots = newBoard
    .map((val, i) => (val === "" ? i : null))
    .filter((i) => i !== null);

  let winnerCheck = checkWin(newBoard);
  if (winnerCheck === "X") {
    return { score: -10 };
  } else if (winnerCheck === "O") {
    return { score: 10 };
  } else if (winnerCheck === "Tie") {
    return { score: 0 };
  }

  let moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if (player === "O") {
      let result = getBestMove(newBoard, "X");
      move.score = result.score;
    } else {
      let result = getBestMove(newBoard, "O");
      move.score = result.score;
    }

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

// Theme toggle
function toggleTheme() {
  if (themeSwitch.checked) {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
  }
}
