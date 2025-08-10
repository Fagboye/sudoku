"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SudokuBoard from "@/components/SudokuBoard";
import NumberPad from "@/components/NumberPad";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  type SudokuBoard as Board,
  generatePuzzle,
  isValidPlacement,
  copyBoard,
  boardsEqual,
  isSolved,
} from "@/lib/sudoku";

type GameState = {
  startingBoard: Board;
  currentBoard: Board;
  solution: Board;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}


export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  // Fixed difficulty: hard
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [fid, setFid] = useState<number | null>(null);
  const [boardSubmitted, setBoardSubmitted] = useState(false);
  const [leaders, setLeaders] = useState<Array<{ fid: number; best_seconds: number }>>([]);

  const timerRef = useRef<number | null>(null);

  const newGame = useCallback(() => {
      const { puzzle, solution } = generatePuzzle("hard");
      const initial: GameState = {
        startingBoard: copyBoard(puzzle),
        currentBoard: copyBoard(puzzle),
        solution,
      };
      setGame(initial);
      setSelected(null);
      setSeconds(0);
      setIsRunning(false);
      setConflicts(new Set());
  }, []);

  useEffect(() => {
    if (!game) newGame();
  }, [game, newGame]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    timerRef.current = id;
    return () => {
      clearInterval(id);
    };
  }, [isRunning]);

  // Signal Farcaster Mini App readiness after first paint
  useEffect(() => {
    let called = false;
    const callReady = () => {
      if (called) return;
      called = true;
      sdk.actions.ready().catch(() => {});
    };
    const scheduleAfterPaint = () => requestAnimationFrame(() => requestAnimationFrame(callReady));
    if (document.readyState === "complete" || document.readyState === "interactive") {
      scheduleAfterPaint();
    } else {
      window.addEventListener("DOMContentLoaded", scheduleAfterPaint, { once: true });
    }
    return () => {
      called = true;
    };
  }, []);

  // auto-attempt Quick Auth once the UI is ready (will be silent if a token already exists)
  useEffect(() => {
    if (!game) return;
    (async () => {
      try {
        const { token } = await sdk.quickAuth.getToken(); // returns silently if already authorized
        const payload = decodeJwtPayload<{ sub: number }>(token);
        setFid(payload.sub);
      } catch {
        // user hasn’t approved yet; you can show a “Sign in with Farcaster” button as fallback
      }
    })();
  }, [game]);

  useEffect(() => {
    // solved if no zeros remain and equals solution (you already compute stop on solved)
    if (!game) return;
    const equalsSolution = boardsEqual(game.currentBoard, game.solution);
    if (equalsSolution && fid && !boardSubmitted) {
      (async () => {
        try {
          await sdk.quickAuth.fetch('/api/submit', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ seconds }),
          });
          setBoardSubmitted(true);
        } catch { /* ignore */ }
      })();
    }
  }, [game, fid, boardSubmitted, seconds]);

  const handleInput = useCallback(
    (value: number) => {
      if (!game || !selected) return;
      const { row, col } = selected;
      if (game.startingBoard[row][col] !== 0) return; // cannot edit givens

      const next = copyBoard(game.currentBoard);
      next[row][col] = value;

      // compute conflicts: highlight any cell that breaks Sudoku rules
      const newConflicts = new Set<string>();
      for (let r = 0; r < 9; r += 1) {
        for (let c = 0; c < 9; c += 1) {
          const v = next[r][c];
          if (v === 0) continue;
          const valid = isValidPlacement(next, r, c, v);
          if (!valid) newConflicts.add(`${r}-${c}`);
        }
      }

    setGame({ ...game, currentBoard: next });
      setConflicts(newConflicts);

    if (!isRunning && seconds === 0) {
      setIsRunning(true);
    }

      if (isSolved(next)) {
        setIsRunning(false);
      }
    },
    [game, selected, isRunning, seconds],
  );

  const handleErase = useCallback(() => {
    if (!game || !selected) return;
    const { row, col } = selected;
    if (game.startingBoard[row][col] !== 0) return;
    const next = copyBoard(game.currentBoard);
    next[row][col] = 0;
    setGame({ ...game, currentBoard: next });
    // recompute conflicts
    const newConflicts = new Set<string>();
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        const v = next[r][c];
        if (v === 0) continue;
        const valid = isValidPlacement(next, r, c, v);
        if (!valid) newConflicts.add(`${r}-${c}`);
      }
    }
    setConflicts(newConflicts);
  }, [game, selected]);

  const resetBoard = useCallback(() => {
    if (!game) return;
    setGame({ ...game, currentBoard: copyBoard(game.startingBoard) });
    setSelected(null);
    setSeconds(0);
    setIsRunning(false);
    setConflicts(new Set());
  }, [game]);

  const giveNewGame = useCallback(() => {
    newGame();
  }, [newGame]);

  const solved = useMemo(() => game && boardsEqual(game.currentBoard, game.solution), [game]);

  if (!game) return null;

  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 gap-4 sm:gap-6 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <h1 className="text-3xl font-semibold tracking-tight">Sudoku</h1>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full max-w-[1100px]">
        <SudokuBoard
          startingBoard={game.startingBoard}
          currentBoard={game.currentBoard}
          selectedCell={selected}
          setSelectedCell={setSelected}
          conflicts={conflicts}
        />

        <div className="flex flex-col gap-3 sm:gap-4 min-w-48 items-center text-center w-full sm:w-auto">
          <div className="text-lg">
            Time: <span className="font-mono px-2 py-1 rounded bg-white/70 dark:bg-neutral-800/70 shadow-sm">{formatTime(seconds)}</span>
          </div>

          {/* Difficulty removed: fixed to hard */}

          <div className="flex gap-2 justify-center w-full">
            <button
              onClick={resetBoard}
              className="px-3 py-2 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 shadow"
            >
              Reset
            </button>
            <button
              onClick={giveNewGame}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              New game
            </button>
            <button
              onClick={async () => {
                try {
                  const r = await fetch('/api/leaderboard');
                  const j = await r.json();
                  setLeaders(j.rows || []);
                } catch {}
              }}
              className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
            >
              View leaderboard
            </button>
          </div>

          {leaders.length > 0 && (
            <div className="w-full max-w-xs text-left text-sm bg-white/70 dark:bg-neutral-800/70 rounded p-3 shadow">
              <div className="font-medium mb-2">This week’s top times</div>
              <ol className="list-decimal list-inside space-y-1">
                {leaders.map((row) => (
                  <li key={row.fid}>{row.best_seconds}s — FID {row.fid}</li>
                ))}
              </ol>
            </div>
          )}

          <NumberPad onInput={handleInput} onErase={handleErase} />

          {solved ? (
            <div className="text-emerald-600 dark:text-emerald-400 font-medium">Solved! 🎉</div>
          ) : null}
        </div>
      </div>
    </div>
    </>
  );
}

function decodeJwtPayload<T = unknown>(token: string): T {
  const base64url = token.split(".")[1];
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64).split("").map(c => "%" + ("00"+c.charCodeAt(0).toString(16)).slice(-2)).join("")
  );
  return JSON.parse(json) as T;
}
