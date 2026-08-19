'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/core/lib/cn';

interface TruncatedPostTextProps {
  text: string;
  className?: string;
  lineClamp?: 3 | 4 | 5 | 6;
}

const LINE_CLAMP_CLASS: Record<number, string> = {
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

/** Clamps post text to a fixed number of lines and only shows a "نمایش بیشتر"
 * toggle when the text is actually long enough to be clamped - measured via
 * scrollHeight vs clientHeight rather than a character-count guess, since
 * line wrapping depends on the container width, not just text length. */
export function TruncatedPostText({ text, className, lineClamp = 5 }: TruncatedPostTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncatable(el.scrollHeight > el.clientHeight + 1);
  }, [text, lineClamp]);

  return (
    <div>
      <p
        ref={textRef}
        className={cn(className, !isExpanded && LINE_CLAMP_CLASS[lineClamp])}
      >
        {text}
      </p>
      {isTruncatable && !isExpanded && (
        // Plain span, not a <button>: this can end up nested inside a <Link>
        // that makes the whole card clickable, and a real button isn't valid
        // HTML inside an anchor. role="button" + explicit key handling keeps
        // it keyboard-accessible without that nesting problem.
        <span
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            setIsExpanded(true);
          }}
          className="text-gold hover:text-ember mt-1.5 block cursor-pointer text-[13px] font-black transition-colors"
        >
          نمایش بیشتر
        </span>
      )}
    </div>
  );
}
