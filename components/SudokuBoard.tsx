"use client";

import { useMemo } from "react";
import type { SudokuBoard } from "@/lib/sudoku";

type Props = {
  startingBoard: SudokuBoard;
  currentBoard: SudokuBoard;
  selectedCell: { row: number; col: number } | null;
  setSelectedCell: (pos: { row: number; col: number } | null) => void;
  conflicts: Set<string>;
};

export default function SudokuBoard({
  startingBoard,
  currentBoard,
  selectedCell,
  setSelectedCell,
  conflicts,
}: Props) {
  const isGiven = (r: number, c: number) => startingBoard[r][c] !== 0;

  const sameNumberPositions = useMemo(() => {
    if (!selectedCell) return new Set<string>();
    const value = currentBoard[selectedCell.row][selectedCell.col];
    const result = new Set<string>();
    if (!value) return result;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (currentBoard[r][c] === value) result.add(`${r}-${c}`);
      }
    }
    return result;
  }, [currentBoard, selectedCell]);

  return (
    <div className="grid grid-cols-9 gap-[1px] bg-neutral-300 dark:bg-neutral-700 p-[1px] rounded-lg select-none shadow w-full max-w-[520px]">
      {currentBoard
        .map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isSelected = selectedCell && selectedCell.row === rIdx && selectedCell.col === cIdx;
            const key = `${rIdx}-${cIdx}`;
            const inSame = sameNumberPositions.has(key);
            const isConflict = conflicts.has(key);
            const borderClass = `border ${
              (rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-b-2" : ""
            } ${cIdx % 3 === 0 && cIdx !== 0 ? "border-l-2" : ""}`;

            return (
              <button
                key={key}
                onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                className={
                  `w-full aspect-square sm:h-12 sm:w-12 sm:aspect-auto flex items-center justify-center bg-white dark:bg-neutral-900 ${borderClass} transition ` +
                  `${isSelected ? "ring-2 ring-blue-500" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"} ` +
                  `${inSame ? "bg-blue-50 dark:bg-blue-950" : ""}`
                }
              >
                <span
                  className={
                    `${isConflict ? "text-red-600 dark:text-red-400" : isGiven(rIdx, cIdx) ? "text-gray-900 dark:text-gray-100" : "text-blue-700 dark:text-blue-300"} ` +
                    `${isGiven(rIdx, cIdx) ? "font-semibold" : ""}`
                  }
                >
                  {cell !== 0 ? cell : ""}
                </span>
              </button>
            );
          }),
        )
        .flat()}
    </div>
  );
}


