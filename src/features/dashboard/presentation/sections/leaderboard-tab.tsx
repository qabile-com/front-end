'use client';

import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';

import { toPersianDigits } from '@/core/lib/persian';
import { Panel } from '../components/panel';
import type { PodiumPlace, LbRow } from '../../domain/dashboard.types';
import { IUserDetailRepository } from '../../domain/dashboard-repository';
import { useState } from 'react';
import { MockUserProfileRepository } from '../../infrastructure/mock-user-profile-repository';

import { UserProfileModalContainer } from '../components/user-profile-modal-container';
import { SeasonCountdownCard } from '../components/season-countdown-card';

const userProfileRepo = new MockUserProfileRepository();
interface LeaderboardTabProps {
  podium: PodiumPlace[];
  leaderboard: LbRow[];
  userDetailRepo: IUserDetailRepository;
  seasonTargetDate: Date;
  seasonPointsNeeded: number;
  seasonName: string;
}

export function LeaderboardTab({
  podium,
  leaderboard,
  userDetailRepo,
  seasonTargetDate,
  seasonPointsNeeded,
  seasonName,
}: LeaderboardTabProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const openUser = (userId: string) => setSelectedUserId(userId);

  return (
    <>
      <div className="grid gap-6 min-[1200px]:grid-cols-[1fr_350px]">
        {/* <div className="grid grid-cols-1 gap-5 min-[1500px]:grid-cols-3 sm:grid-cols-2"> */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 items-end gap-4">
            {podium.map((p) => {
              const first = p.rank === 1;
              return (
                <div
                  key={p.rank}
                  onClick={() => openUser(p.name)}
                  className={cn(
                    'border-hair relative rounded-[26px] border px-4 pt-6 pb-5 text-center transition-transform duration-300 [background:var(--glass)] hover:-translate-y-1',
                    first &&
                      'mb-2 border-[rgba(243,186,99,.36)] [background:radial-gradient(120%_120%_at_50%_0%,rgba(243,186,99,.12),var(--glass))]',
                  )}
                >
                  {first && (
                    <Icon
                      name="star"
                      size={32}
                      className="text-gold absolute start-1/2 -top-[18px] translate-x-1/2"
                    />
                  )}
                  <span
                    className={cn(
                      'absolute start-3 top-3 grid size-[26px] place-items-center rounded-xs text-xs font-extrabold',
                      first
                        ? 'text-[#1a0a00] [background:var(--fire-grad)]'
                        : 'border-hair text-ink-3 text-gold border [background:var(--glass-2)]',
                    )}
                  >
                    {toPersianDigits(p.rank)}
                  </span>
                  <span
                    className="border-hair-2 mx-auto block size-[70px] rounded-full border-2"
                    style={{ background: p.avatar }}
                  />
                  <p className="mt-3 text-[15px] font-extrabold">{p.name}</p>
                  <p className="text-gold text-[22px] font-black">{p.points}</p>
                </div>
              );
            })}
          </div>

          <Panel
            title="لیگ ققنوس طلایی · فصل ۷"
            action={<span className="text-ember text-[13px] font-extrabold">۶ روز مانده</span>}
            bodyClassName="p-0"
          >
            <table className="w-full">
              <thead>
                <tr className="text-ink-3 text-[12px] uppercase">
                  <th className="w-16 px-5 py-3 text-center font-bold">#</th>
                  <th className="px-2 py-3 text-start font-bold">کاربر</th>
                  <th className="px-2 py-3 text-start font-bold">امتیاز</th>
                  <th className="px-5 py-3 text-start font-bold">سطح</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr
                    key={row.rank}
                    className={cn(
                      'rounded-2xl transition-colors',
                      row.isYou
                        ? 'text-[#1a0a00] shadow-[0_8px_24px_-10px_var(--glow)] [background:var(--fire-grad)]'
                        : 'hover:[background:var(--glass-2)]',
                    )}
                    onClick={() => !row.isYou && openUser(row.name)}
                  >
                    <td className="px-5 py-3 text-center text-base font-black tabular-nums">
                      {toPersianDigits(row.rank)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-[38px] shrink-0 rounded-full"
                          style={{ background: row.avatar }}
                        />
                        <b className="text-sm font-bold">{row.name}</b>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-[15px] font-black tabular-nums">{row.points}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm font-bold">
                        {/* <Icon name="flame" size={15} /> */}
                        {row.streak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
        {/* </div> */}
        <div className="border-hair sticky top-[88px] h-fit overflow-hidden rounded-[20px] border [background:var(--glass)] max-[1200px]:static">
          <SeasonCountdownCard
            targetDate={seasonTargetDate}
            pointsNeeded={seasonPointsNeeded}
            seasonName={seasonName}
          />
        </div>
      </div>
      {/* User Detail Modal */}
      {selectedUserId !== null && (
        <UserProfileModalContainer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          repository={userProfileRepo}
        />
      )}
    </>
  );
}
