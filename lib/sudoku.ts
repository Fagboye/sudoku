export type SudokuBoard = number[][]; // 9x9, 0 represents empty

const BOARD_SIZE = 9;
const BOX_SIZE = 3;

function createEmptyBoard(): SudokuBoard {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function cloneBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]);
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function findEmptyCell(board: SudokuBoard): [number, number] | null {
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
}

export function isValidPlacement(
  board: SudokuBoard,
  row: number,
  col: number,
  value: number,
): boolean {
  if (value < 1 || value > 9) return false;

  for (let i = 0; i < BOARD_SIZE; i += 1) {
    if (i !== col && board[row][i] === value) return false;
    if (i !== row && board[i][col] === value) return false;
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = startRow; r < startRow + BOX_SIZE; r += 1) {
    for (let c = startCol; c < startCol + BOX_SIZE; c += 1) {
      if ((r !== row || c !== col) && board[r][c] === value) return false;
    }
  }

  return true;
}

function solveBacktrack(board: SudokuBoard): boolean {
  const spot = findEmptyCell(board);
  if (!spot) return true;
  const [row, col] = spot;

  const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const n of candidates) {
    if (isValidPlacement(board, row, col, n)) {
      board[row][col] = n;
      if (solveBacktrack(board)) return true;
      board[row][col] = 0;
    }
  }
  return false;
}

function countSolutions(board: SudokuBoard, limit = 2): number {
  // Backtracking counter with early cutoff at `limit`
  const spot = findEmptyCell(board);
  if (!spot) return 1;
  const [row, col] = spot;

  let solutions = 0;
  for (let n = 1; n <= 9; n += 1) {
    if (isValidPlacement(board, row, col, n)) {
      board[row][col] = n;
      solutions += countSolutions(board, limit);
      if (solutions >= limit) {
        board[row][col] = 0;
        return solutions; // early cutoff
      }
      board[row][col] = 0;
    }
  }
  return solutions;
}

export function solve(board: SudokuBoard): SudokuBoard | null {
  const working = cloneBoard(board);
  const ok = solveBacktrack(working);
  return ok ? working : null;
}

function generateCompleteBoard(): SudokuBoard {
  const board = createEmptyBoard();
  solveBacktrack(board);
  return board;
}

export type Difficulty = "easy" | "medium" | "hard";

function targetEmptyCells(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return 40; // 41 empty cells (~40 givens)
    case "hard":
      return 54; // harder with fewer givens
    case "medium":
    default:
      return 48;
  }
}

export function generatePuzzle(difficulty: Difficulty = "medium") {
  // Strategy: generate a full valid board, then remove symmetric pairs
  // while preserving a unique solution.
  const full = generateCompleteBoard();
  const puzzle = cloneBoard(full);

  const coords: Array<[number, number]> = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      coords.push([r, c]);
    }
  }
  const order = shuffle(coords);

  const targetEmpties = targetEmptyCells(difficulty);
  let removed = 0;
  let attempts = 0;
  const maxAttempts = order.length * 3;

  while (removed < targetEmpties && attempts < maxAttempts && order.length) {
    attempts += 1;
    const [r, c] = order.pop()!;
    const mirror: [number, number] = [BOARD_SIZE - 1 - r, BOARD_SIZE - 1 - c];

    const positions: Array<[number, number]> = [[r, c]];
    // ensure symmetric removal if not the same cell
    if (!(mirror[0] === r && mirror[1] === c)) positions.push(mirror);

    const savedValues = positions.map(([rr, cc]) => puzzle[rr][cc]);
    let canRemove = true;
    for (const [rr, cc] of positions) {
      puzzle[rr][cc] = 0;
    }

    const copy = cloneBoard(puzzle);
    const solutionCount = countSolutions(copy, 2);
    if (solutionCount !== 1) {
      canRemove = false;
    }

    if (!canRemove) {
      // revert
      positions.forEach(([rr, cc], i) => {
        puzzle[rr][cc] = savedValues[i];
      });
    } else {
      removed += positions.length;
    }
  }

  // Recompute solution to return alongside
  const solution = solve(full)!;
  return { puzzle, solution };
}

export function isSolved(board: SudokuBoard): boolean {
  // Board must be fully filled and valid in all rows, cols, and boxes
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const v = board[r][c];
      if (v === 0) return false;
      if (!isValidPlacement(board, r, c, v)) return false;
    }
  }
  return true;
}

export function boardsEqual(a: SudokuBoard, b: SudokuBoard): boolean {
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export function copyBoard(board: SudokuBoard): SudokuBoard {
  return cloneBoard(board);
}


