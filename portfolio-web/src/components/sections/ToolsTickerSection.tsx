'use client';

import Image from 'next/image';
import type { Tool } from '@/lib/types/tool';

interface ToolsTickerSectionProps {
  tools: Tool[];
}

export default function ToolsTickerSection({ tools }: ToolsTickerSectionProps) {
  if (tools.length === 0) return null;

  // Duplicate items to ensure seamless loop regardless of viewport width
  const items = [...tools, ...tools, ...tools];

  return (
    <section
      aria-label="Technologies I work with"
      className="py-12 bg-[#0d0d0d] border-y border-[#27272a] overflow-hidden"
    >
      {/* Fade masks on both sides */}
      <div
        className="relative"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <ul
          className="ticker-track flex gap-6 w-max"
          aria-hidden="true"
        >
          {items.map((tool, i) => (
            <li
              key={`${tool.id}-${i}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#27272a] flex items-center justify-center p-2.5 group-hover:border-indigo-500/40 transition-colors duration-300">
                <Image
                  src={tool.iconUrl}
                  alt={tool.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300 whitespace-nowrap">
                {tool.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
