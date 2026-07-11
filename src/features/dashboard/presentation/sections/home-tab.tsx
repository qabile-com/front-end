// src/features/dashboard/presentation/sections/home-tab.tsx
'use client';

import { useRef, useState } from 'react';
import { Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { AI_REPLIES } from '@/features/dashboard/domain/dashboard.data';
import type {
  CurrentUser,
  StatCard,
  RoadmapItem,
  RoadmapStatus,
  ChatMessage,
} from '@/features/dashboard/domain/dashboard.types';
import { Panel } from '../components/panel';
import { AdamAvatar, PhoenixIcon } from './dashboard-sidebar';
import { MockRoadmapStepRepository } from '../../infrastructure/mock-roadmap-repository';
import { useRoadmapStepDetail } from '../../application/use-roadmap-step-detail';
import { StepModal } from '../components/step-modal';

const STAT_TONES: Record<string, string> = {
  fire: 'text-ember [background:rgba(255,98,0,.15)]',
  gold: 'text-gold [background:rgba(243,186,99,.12)]',
  ok: 'text-[#2bd4a8] [background:rgba(43,212,168,.1)]',
  blue: 'text-[#5b7cfa] [background:rgba(91,124,250,.1)]',
};

interface HomeTabProps {
  user: CurrentUser; // new: needed for the roadmap modal
  stats: StatCard[];
  roadmap: RoadmapItem[];
  aiSeed: ChatMessage;
  aiQuickReplies: { label: string; send: string }[];
}

const roadmapStepRepo = new MockRoadmapStepRepository();

export function HomeTab({ user, stats, roadmap, aiSeed, aiQuickReplies }: HomeTabProps) {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const { detail, loading: stepLoading } = useRoadmapStepDetail(roadmapStepRepo, selectedStepId);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-hair hover:border-hair-2 flex items-center gap-3.5 rounded-[20px] border px-5 py-[22px] transition-[transform,border-color] duration-300 [background:var(--glass)] hover:-translate-y-[3px]"
          >
            <span
              className={cn(
                'grid size-[46px] place-items-center rounded-[14px]',
                STAT_TONES[stat.tone],
              )}
            >
              <Icon name={stat.icon as IconName} size={22} />
            </span>
            <span className="leading-tight">
              <b className="text-gradient-fire block text-2xl font-black">{stat.value}</b>
              <span className="text-ink-3 text-[13px]">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RoadmapPanel roadmap={roadmap} user={user} onItemClick={(num) => setSelectedStepId(num)} />
        <AiPanel seedMessage={aiSeed} quickReplies={aiQuickReplies} />
      </div>
      {selectedStepId !== null && detail && (
        <StepModal
          isOpen={!!detail}
          onClose={() => setSelectedStepId(null)}
          onComplete={() => {
            // TODO: update status in repo/local state
            setSelectedStepId(null);
          }}
          detail={detail}
        />
      )}
    </div>
  );
}

const RM_NUM: Record<RoadmapStatus, string> = {
  done: 'text-[#1a0a00] [background:linear-gradient(135deg,#1f8a5b,#2bd4a8)]',
  current: 'text-[#1a0a00] [background:var(--fire-grad)]',
  next: 'text-ink-3 [background:var(--glass-2)]',
};
const RM_BADGE: Record<RoadmapStatus, { label: string; cls: string }> = {
  done: {
    label: 'تکمیل شد',
    cls: 'text-[#2bd4a8] [background:rgba(43,212,168,.12)] border-[rgba(43,212,168,.22)]',
  },
  current: {
    label: 'در جریان',
    cls: 'text-ember [background:rgba(255,98,0,.14)] border-[rgba(255,98,0,.20)]',
  },
  next: { label: 'شروع نشده', cls: 'text-ink-3 [background:var(--glass-2)] border-hair' },
};

function RoadmapPanel({
  roadmap,
  user,
  onItemClick,
}: {
  roadmap: RoadmapItem[];
  user: CurrentUser;
  onItemClick: (num: number) => void;
}) {
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <Panel
      title="نقشه راه من"
      action={
        <a
          className="text-gold cursor-pointer text-[13px] font-bold"
          onClick={() => setShowRoadmap(true)}
        >
          مشاهده همه
        </a>
      }
      bodyClassName="p-0"
    >
      {roadmap.map((item, i) => (
        <div
          key={item.num}
          onClick={() => onItemClick(item.num)}
          className={cn(
            'flex items-center gap-3.5 px-5 py-4',
            i < roadmap.length - 1 && 'border-hair border-b',
          )}
        >
          <span
            className={cn(
              'grid size-9.5 shrink-0 place-items-center rounded-[11px] text-sm font-extrabold',
              RM_NUM[item.status],
            )}
          >
            {item.status === 'done' ? (
              <Icon name="check" size={18} />
            ) : item.status === 'current' ? (
              <Icon name="flame" size={18} />
            ) : (
              <PersianNum n={item.num} />
            )}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="text-ink-3 mb-2 block text-[11px] uppercase">{item.type}</span>
            <b className="block truncate text-[14.5px] font-extrabold">{item.title}</b>
          </span>
          <span className="text-gold flex shrink-0 items-center gap-1 text-[13px] font-bold">
            <PhoenixIcon className="size-4 rounded-full" />+{toFa(item.xp)}
          </span>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold',
              RM_BADGE[item.status].cls,
            )}
          >
            {RM_BADGE[item.status].label}
          </span>
          <Icon name="arrow-left" size={18} className="text-ink-3 shrink-0" />
        </div>
      ))}
    </Panel>
  );
}

function AiPanel({
  seedMessage,
  quickReplies,
}: {
  seedMessage: ChatMessage;
  quickReplies: { label: string; send: string }[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([seedMessage]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = AI_REPLIES[Math.floor(messages.length % AI_REPLIES.length)]!;
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
      setTyping(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }, 1400);
  };

  return (
    <div className="border-hair flex h-125 flex-col overflow-hidden rounded-[20px] border [background:var(--glass)]">
      <div className="border-hair flex items-center gap-3 border-b px-5 py-4">
        <AdamAvatar className="border-hair-2 size-10.5 border-[1.5px]" />
        <span className="leading-tight">
          <b className="mb-1 block text-[15px] font-black">آدم</b>
          <small className="flex items-center gap-1.5 text-[12px] text-[#2bd4a8]">
            <span className="size-1.5 rounded-full bg-[#2bd4a8]" />
            آنلاین · منتور هوشمند قبیله
          </small>
        </span>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[72%] rounded-[14px] px-3.5 py-2.75 text-[14.5px] leading-[1.7]',
              msg.from === 'bot'
                ? 'border-hair self-start rounded-es-[4px] border [background:var(--glass-2)]'
                : 'self-end rounded-ee-[4px] font-semibold text-[#1a0a00] [background:var(--fire-grad)]',
            )}
          >
            {msg.from === 'bot' && (
              <span className="text-gold mb-1 block text-[11px] font-bold">آدم 🔥</span>
            )}
            {msg.text}
          </div>
        ))}
        {typing && (
          <div className="border-hair inline-flex gap-1 self-start rounded-[14px] rounded-es-[4px] border px-4 py-3 [background:var(--glass-2)]">
            <i className="typing-dot bg-gold size-1.5 rounded-full" />
            <i className="typing-dot bg-gold size-1.5 rounded-full [animation-delay:.2s]" />
            <i className="typing-dot bg-gold size-1.5 rounded-full [animation-delay:.4s]" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 px-5 pb-2">
        {quickReplies.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => send(q.send)}
            className="text-ink-2 border-hair hover:text-gold hover:border-hair-2 rounded-[9px] border px-3 py-1.5 text-[12.5px] font-bold transition-colors [background:var(--glass-2)]"
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="border-hair flex items-center gap-2.5 border-t p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="سوالت رو بنویس..."
          className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 h-11 flex-1 rounded-xl border px-3.5 text-[14px] outline-none [background:var(--glass-2)]"
        />
        <button
          type="button"
          onClick={() => send(input)}
          className="grid size-11 shrink-0 place-items-center rounded-sm text-[#1a0a00] [background:var(--fire-grad)] active:scale-90"
        >
          <Icon name="send" size={18} className="-scale-x-100" />
        </button>
      </div>
    </div>
  );
}

const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (n: number) => String(n).replace(/\d/g, (d) => FA[+d]!);
function PersianNum({ n }: { n: number }) {
  return <>{toFa(n)}</>;
}
