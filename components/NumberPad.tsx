"use client";

type Props = {
  onInput: (value: number) => void;
};

export default function NumberPad({ onInput }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="grid grid-cols-3 gap-2 w-full max-w-[320px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => onInput(n)}
            className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition text-lg shadow-sm border border-neutral-200/60 dark:border-neutral-700/60"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}


