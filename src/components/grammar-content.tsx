import type { GrammarBlock } from "@/lib/grammar-types";
import { SpeakButton } from "@/components/speak-button";
import { AlertTriangleIcon, PencilIcon } from "@/components/icons";

export function GrammarContent({ blocks }: { blocks: GrammarBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="leading-relaxed text-stone-700 dark:text-stone-300">
                {block.text}
              </p>
            );

          case "example":
            return (
              <div
                key={i}
                className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/40"
              >
                <div className="flex items-center justify-end gap-2">
                  <SpeakButton text={block.hebrew} />
                  <p dir="rtl" lang="he" className="text-right text-xl text-stone-900 dark:text-stone-100">
                    {block.hebrew}
                  </p>
                </div>
                {block.transliteration && (
                  <p className="mt-0.5 text-sm italic text-brand-700/80 dark:text-brand-500/80">
                    {block.transliteration}
                  </p>
                )}
                <p className="mt-1 text-stone-600 dark:text-stone-400">{block.translation}</p>
                {block.note && (
                  <p className="mt-1 text-sm text-brand-800 dark:text-brand-400">{block.note}</p>
                )}
              </div>
            );

          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table dir="ltr" className="w-full min-w-max border-collapse text-sm">
                  <thead>
                    <tr className="bg-stone-100 dark:bg-stone-900">
                      {block.headers.map((h, hi) => (
                        <th
                          key={hi}
                          className="border-b border-stone-200 px-3 py-2 text-center font-semibold text-stone-700 dark:border-stone-800 dark:text-stone-300"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className="odd:bg-white even:bg-stone-50 dark:odd:bg-stone-950 dark:even:bg-stone-900">
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            dir="auto"
                            className="border-b border-stone-100 px-3 py-2 text-center text-stone-800 last:text-lg dark:border-stone-900 dark:text-stone-200"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "list":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-stone-700 dark:text-stone-300">
                {block.items.map((item, ii) => (
                  <li key={ii} dir="auto">
                    {item}
                  </li>
                ))}
              </ul>
            );

          case "mistakes":
            return (
              <div
                key={i}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40"
              >
                <p className="mb-2 flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-400">
                  <AlertTriangleIcon className="h-4 w-4" /> Типичные ошибки
                </p>
                <ul className="list-disc space-y-1.5 pl-5 text-amber-900/90 dark:text-amber-300/90">
                  {block.items.map((item, ii) => (
                    <li key={ii} dir="auto">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "exercise":
            return (
              <div
                key={i}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/60"
              >
                <p className="mb-2 flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <PencilIcon className="h-4 w-4" /> Мини-упражнения
                </p>
                <ol className="list-decimal space-y-3 pl-5 text-stone-700 dark:text-stone-300">
                  {block.items.map((item, ii) => (
                    <li key={ii} dir="auto" className="flex flex-col gap-1">
                      <span>{item.prompt}</span>
                      <details>
                        <summary className="w-fit cursor-pointer text-sm font-medium text-brand-700 dark:text-brand-400">
                          Показать ответ
                        </summary>
                        <span dir="auto" className="mt-1 block text-sm text-stone-600 dark:text-stone-400">
                          {item.answer}
                        </span>
                      </details>
                    </li>
                  ))}
                </ol>
              </div>
            );
        }
      })}
    </div>
  );
}
