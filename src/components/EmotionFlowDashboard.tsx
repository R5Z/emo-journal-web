'use client';

import React, { useMemo, useState } from 'react';
import { EMOTION_CATEGORIES } from '@/data/emotion-setup';
import { CategoryScore, JournalEntry } from '@/types';

// ============================================
// Types
// ============================================

type EmotionEntry = {
  createdAt: string;
  emotionResult: {
    topCategories: CategoryScore[];
    isNeutral: boolean;
  };
};

type DailyEmotion = {
  date: string;
  primaryCategoryId: number;
  primaryColor: string;
  allCategoryIds: number[];
};

type MonthData = {
  monthKey: string;
  label: string;
  range: string;
  daysRecorded: number;
  totalDays: number;
  dailyEmotions: DailyEmotion[];
  usedEmotionIds: number[];
  insight: string;
};

// ============================================
// Helpers
// ============================================

const NEUTRAL_COLOR = '#E5E5EA';
const BRIGHT_IDS = new Set([1, 2, 3, 4, 5]); // 기쁨, 만족, 설렘, 평온, 안도

const categoryMap = new Map(EMOTION_CATEGORIES.map((c) => [c.categoryId, c]));

const getColor = (id: number) => categoryMap.get(id)?.colorHex || NEUTRAL_COLOR;
const getName = (id: number) => categoryMap.get(id)?.name || '중립';

const SHORT_NAMES: Record<number, string> = {
  3: '설렘',
  4: '평온',
  6: '스트레스',
  8: '걱정',
  21: '황당',
};
const getShortName = (id: number) => SHORT_NAMES[id] || getName(id);

function formatRange(dates: string[]): string {
  if (dates.length === 0) return '';
  const [, fm, fd] = dates[0].split('-').map(Number);
  const [, lm, ld] = dates[dates.length - 1].split('-').map(Number);
  return `${fm}월 ${fd}일 – ${lm}월 ${ld}일`;
}

function generateInsight(daily: DailyEmotion[]): string {
  if (daily.length < 3) return '기록이 쌓이면 감정 흐름을 읽어 드릴게요.';

  const third = Math.ceil(daily.length / 3);
  const ratio = [
    daily.slice(0, third),
    daily.slice(third, third * 2),
    daily.slice(third * 2),
  ].map((part) => {
    if (part.length === 0) return 0;
    return part.filter((d) => BRIGHT_IDS.has(d.primaryCategoryId)).length / part.length;
  });

  if (ratio[0] > 0.6 && ratio[2] > 0.6) return '따뜻한 색이 고르게 이어진 시기였어요.';
  if (ratio[0] > 0.5 && ratio[2] < 0.3)
    return '초반에 밝은 감정이 이어지다, 후반에 잠시 가라앉는 흐름이 있었어요.';
  if (ratio[0] < 0.3 && ratio[2] > 0.5)
    return '초반에 무거운 감정이 머물렀지만, 후반으로 갈수록 가벼워졌어요.';
  if (ratio[1] < 0.3) return '중반 즈음 감정이 가라앉는 흐름이 있었어요.';
  return '다양한 감정이 섞여 있던 시기였어요.';
}

function processMonthlyData(entries: EmotionEntry[]): MonthData[] {
  if (entries.length === 0) return [];

  const byMonth = new Map<string, EmotionEntry[]>();
  entries.forEach((e) => {
    const key = e.createdAt.substring(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  });

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return [...byMonth.keys()]
    .sort()
    .reverse()
    .map((monthKey) => {
      const monthEntries = byMonth.get(monthKey)!;

      const byDate = new Map<string, EmotionEntry[]>();
      monthEntries.forEach((e) => {
        const date = e.createdAt.split(' ')[0];
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(e);
      });

      const sortedDates = [...byDate.keys()].sort();
      const allUsedIds = new Set<number>();
      const dailyEmotions: DailyEmotion[] = [];

      sortedDates.forEach((date) => {
        const dayEntries = byDate.get(date)!;
        const scoreMap = new Map<number, number>();
        dayEntries.forEach((entry) => {
          if (!entry.emotionResult?.isNeutral) {
            entry.emotionResult.topCategories.forEach((cat) => {
              scoreMap.set(
                cat.categoryId,
                (scoreMap.get(cat.categoryId) || 0) + cat.totalScore,
              );
            });
          }
        });

        if (scoreMap.size > 0) {
          let primaryId = 0;
          let maxScore = -1;
          scoreMap.forEach((score, id) => {
            if (score > maxScore) {
              maxScore = score;
              primaryId = id;
            }
          });

          const allIds = [...scoreMap.keys()];
          allIds.forEach((id) => allUsedIds.add(id));

          dailyEmotions.push({
            date,
            primaryCategoryId: primaryId,
            primaryColor: getColor(primaryId),
            allCategoryIds: allIds,
          });
        } else {
          dailyEmotions.push({
            date,
            primaryCategoryId: 0,
            primaryColor: NEUTRAL_COLOR,
            allCategoryIds: [],
          });
        }
      });

      const [year, month] = monthKey.split('-').map(Number);
      const totalDays = new Date(year, month, 0).getDate();

      return {
        monthKey,
        label: monthKey === currentKey ? '이번 달' : `${sortedDates.length}일`,
        range: formatRange(sortedDates),
        daysRecorded: sortedDates.length,
        totalDays,
        dailyEmotions,
        usedEmotionIds: [...allUsedIds],
        insight: generateInsight(dailyEmotions),
      };
    });
}

// ============================================
// Sub-components
// ============================================

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-neutral-300 transition-transform duration-200 dark:text-neutral-600 ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function GradientBar({
  dailyEmotions,
  daysRecorded,
  totalDays,
}: {
  dailyEmotions: DailyEmotion[];
  daysRecorded: number;
  totalDays: number;
}) {
  if (dailyEmotions.length === 0) return null;

  const pct = (daysRecorded / totalDays) * 100;
  const cols = dailyEmotions.map((d) => d.primaryColor);
  const gradient =
    cols.length === 1
      ? cols[0]
      : `linear-gradient(to right, ${cols.join(', ')})`;
  const midDay = Math.round(daysRecorded / 2);

  return (
    <div>
      <div
        className="mb-[3px] flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500"
        style={{ width: `${pct}%` }}
      >
        <span>1</span>
        <span>{midDay}</span>
        <span>{daysRecorded}</span>
      </div>
      <div className="h-[18px] overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: gradient }}
        />
      </div>
    </div>
  );
}

function DotRow({
  categoryId,
  dailyEmotions,
}: {
  categoryId: number;
  dailyEmotions: DailyEmotion[];
}) {
  const color = getColor(categoryId);
  const name = getShortName(categoryId);

  return (
    <div className="mb-px flex items-center">
      <div className="flex flex-1">
        {dailyEmotions.map((d, i) => {
          const active = d.allCategoryIds.includes(categoryId);
          return (
            <div key={i} className="flex h-[11px] flex-1 items-center justify-center">
              <span
                className={active ? 'block' : 'block bg-neutral-200 dark:bg-neutral-700'}
                style={
                  active
                    ? { width: 5.5, height: 5.5, borderRadius: 2.75, backgroundColor: color }
                    : { width: 2, height: 2, borderRadius: 1 }
                }
              />
            </div>
          );
        })}
      </div>
      <span className="ml-2 min-w-[45px] text-right text-[11px] text-neutral-400 dark:text-neutral-500">
        {name}
      </span>
    </div>
  );
}

function MonthCard({ data }: { data: MonthData }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-[22px]">
      <button
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-baseline justify-between"
        aria-expanded={open}
        aria-label={`${data.label} 감정 흐름 ${open ? '접기' : '펼치기'}`}
      >
        <div className="flex items-baseline">
          <span className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
            {data.label}{' '}
          </span>
          <span className="text-[13px] text-neutral-400 dark:text-neutral-500">
            {data.range}
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      <GradientBar
        dailyEmotions={data.dailyEmotions}
        daysRecorded={data.daysRecorded}
        totalDays={data.totalDays}
      />

      {open && (
        <div className="mt-2">
          {data.usedEmotionIds.map((id) => (
            <DotRow key={id} categoryId={id} dailyEmotions={data.dailyEmotions} />
          ))}
          <div className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
            <p className="text-[13px] leading-5 text-neutral-600 dark:text-neutral-400">
              {data.insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main
// ============================================

type Props = {
  entries: JournalEntry[];
};

export default function EmotionFlowDashboard({ entries }: Props) {
  const monthlyData = useMemo(() => processMonthlyData(entries), [entries]);

  return (
    <>
      {/* 감정 흐름 */}
      <section className="mx-4 mb-2 rounded-xl bg-white p-4 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            감정 흐름
          </h2>
          <span className="text-[15px] text-neutral-400 dark:text-neutral-500">
            {new Date().getFullYear()}
          </span>
        </div>

        {monthlyData.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              일기를 작성하면 감정 흐름이 여기에 나타나요.
            </p>
          </div>
        ) : (
          monthlyData.map((data) => <MonthCard key={data.monthKey} data={data} />)
        )}
      </section>

      {/* 감정 카테고리 범례 */}
      <section className="mx-4 mb-2 rounded-xl bg-white p-4 dark:bg-neutral-900">
        <h2 className="mb-3 text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
          감정 카테고리
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_CATEGORIES.map((cat) => (
            <div
              key={cat.categoryId}
              className="flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-2.5"
              style={{ backgroundColor: cat.colorHex + '18' }}
            >
              <span
                className="block h-2.5 w-2.5 rounded-[3px]"
                style={{ backgroundColor: cat.colorHex }}
              />
              <span className="text-[13px] text-neutral-600 dark:text-neutral-300">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
