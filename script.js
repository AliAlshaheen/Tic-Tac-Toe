const cells = document.querySelectorAll(".cell");
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const drawScoreEl = document.getElementById("draw-score");
const resetBtn = document.getElementById("reset-btn");
const difficultySelect = document.getElementById("difficulty");
const modeToggle = document.getElementById("mode-toggle");
const boardEl = document.querySelector(".board");
const canvas = document.getElementById("winning-line");
const ctx = canvas.getContext("2d");

let board = Array(9).fill("");
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let humanTurn = true;
let difficulty = "easy";

difficultySelect.addEventListener("change", (e) => {
  difficulty = e.target.value;
  resetGame();
});

modeToggle.addEventListener("click", () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "light" ? "dark" : "light";
  modeToggle.textContent =
    document.documentElement.dataset.theme === "light" ? "☀️" : "🌙";
});

resetBtn.addEventListener("click", resetGame);

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick, { passive: true });
});

function handleCellClick(e) {
  if (!gameActive) return;
  if (!humanTurn) return;
  const cellIndex = e.target.getAttribute("data-index");
  if (board[cellIndex] !== "") return;
  makeMove(cellIndex, "X");
  humanTurn = false;
  if (checkWin("X")) {
    endGame("X");
    return;
  } else if (isDraw()) {
    endGame("draw");
    return;
  }
  setTimeout(() => {
    computerMove();
    humanTurn = true;
  }, 500);
}

function computerMove() {
  if (!gameActive) return;
  let move;
  if (difficulty === "easy") move = getRandomMove();
  else if (difficulty === "medium") move = getMediumMove();
  else move = getBestMove(board, "O").index;
  makeMove(move, "O");
  if (checkWin("O")) {
    endGame("O");
  } else if (isDraw()) {
    endGame("draw");
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = document.querySelector(`.cell[data-index='${index}']`);
  cell.textContent = player;
  cell.classList.add(player);
}

function checkWin(player) {
  const w = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let p of w) {
    const [a, b, c] = p;
    if (board[a] === player && board[b] === player && board[c] === player) {
      drawWinningLine(a, b, c);
      return true;
    }
  }
  return false;
}

function isDraw() {
  return board.every((cell) => cell !== "");
}

function endGame(result) {
  gameActive = false;
  if (result === "X") {
    playerScore++;
    playerScoreEl.textContent = playerScore;
  } else if (result === "O") {
    computerScore++;
    computerScoreEl.textContent = computerScore;
  } else {
    drawScore++;
    drawScoreEl.textContent = drawScore;
  }
}

function resetGame() {
  board.fill("");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("X", "O");
  });
  gameActive = true;
  humanTurn = true;
  clearWinningLine();
}

function getRandomMove() {
  const available = board
    .map((v, i) => (v === "" ? i : null))
    .filter((v) => v !== null);
  const r = Math.floor(Math.random() * available.length);
  return available[r];
}

function getMediumMove() {
  let m = findBestImmediateMove("O");
  if (m !== null) return m;
  m = findBestImmediateMove("X");
  if (m !== null) return m;
  return getRandomMove();
}

function findBestImmediateMove(player) {
  const w = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let p of w) {
    const [a, b, c] = p;
    const line = [board[a], board[b], board[c]];
    if (
      line.filter((val) => val === player).length === 2 &&
      line.includes("")
    ) {
      return [a, b, c].find((i) => board[i] === "");
    }
  }
  return null;
}

function getBestMove(newBoard, player) {
  if (checkTerminalState(newBoard, "X")) return scoreMove(newBoard, "X", "O");
  if (checkTerminalState(newBoard, "O")) return scoreMove(newBoard, "O", "X");
  if (newBoard.every((cell) => cell !== "")) return { score: 0 };
  const moves = [];
  const availableSpots = newBoard
    .map((val, idx) => (val === "" ? idx : null))
    .filter((v) => v !== null);
  for (let spot of availableSpots) {
    let boardCopy = [...newBoard];
    boardCopy[spot] = player;
    let result;
    if (player === "O") {
      result = getBestMove(boardCopy, "X");
    } else {
      result = getBestMove(boardCopy, "O");
    }
    moves.push({ index: spot, score: result.score });
  }
  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }
  return bestMove;
}

function checkTerminalState(testBoard, player) {
  const w = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let p of w) {
    const [a, b, c] = p;
    if (
      testBoard[a] === player &&
      testBoard[b] === player &&
      testBoard[c] === player
    )
      return true;
  }
  return false;
}

function scoreMove(testBoard, player, opponent) {
  if (checkTerminalState(testBoard, player)) {
    return player === "O" ? { score: 10 } : { score: -10 };
  }
  return { score: 0 };
}

function drawWinningLine(a, b, c) {
  const boardRect = boardEl.getBoundingClientRect();
  canvas.width = boardRect.width;
  canvas.height = boardRect.height;
  function getCellCenter(i) {
    const cell = document.querySelector(`.cell[data-index='${i}']`);
    const cellRect = cell.getBoundingClientRect();
    return {
      x: cellRect.left - boardRect.left + cellRect.width / 2,
      y: cellRect.top - boardRect.top + cellRect.height / 2,
    };
  }
  const start = getCellCenter(a);
  const end = getCellCenter(c);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--line-color")
    .trim();
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  let progress = 0;
  function animateLine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    const currentX = start.x + (end.x - start.x) * progress;
    const currentY = start.y + (end.y - start.y) * progress;
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    if (progress < 1) {
      progress += 0.02;
      requestAnimationFrame(animateLine);
    }
  }
  animateLine();
}

function clearWinningLine() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
