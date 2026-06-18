'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import EntryCard from '@/components/EntryCard';
import { getEmotionDisplay } from '@/domain/emotion/formatter';
import { getEntriesByDate, getEntriesByRange } from '@/lib/db';
import { useDateStore } from '@/store/useDateStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useSettingsStore, FONT_SIZES } from '@/store/useSettingsStore';
import { JournalEntry, EmotionMap } from '@/types';

dayjs.locale('ko');

function toGradient(colors: string[], stops?: number[]): string {
  if (!colors || colors.length === 0) return 'transparent';
  if (colors.length === 1) return colors[0];
  const pts = colors.map((c, i) => {
    const pct =
      stops && stops[i] != null
        ? Math.round(stops[i] * 100)
        : Math.round(((i + 1) / colors.length) * 100);
    return `${c} ${pct}%`;
  });
  return `linear-gradient(to bottom, ${pts.join(', ')})`;
}

export default function HomePage() {
  const { selectedDate, setSelectedDate } = useDateStore();
  const { weekStart, fontSize, loadSettings } = useSettingsStore();
  const openNew = useEditorStore((s) => s.openNew);
  const openEdit = useEditorStore((s) => s.openEdit);
  const savedToken = useEditorStore((s) => s.savedToken);

  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [emotionMap, setEmotionMap] = useState<Record<string, EmotionMap>>({});

  const today = dayjs();
  const todayNum = today.format('D');
  const todayStr = today.format('YYYY-MM-DD');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const goToToday = () => setSelectedDate(todayStr);

  const weekDays = useMemo(() => {
    const offset = weekStart === 'monday' ? 1 : 0;
    const start = dayjs(selectedDate).startOf('week').add(offset, 'day');
    return Array.from({ length: 7 }).map((_, i) => start.add(i, 'day'));
  }, [selectedDate, weekStart]);

  const calendarGrid = useMemo(() => {
    const offset = weekStart === 'monday' ? 1 : 0;
    const startDay = dayjs(selectedDate).startOf('month').startOf('week').add(offset, 'day');
    const adjustedStart = startDay.isAfter(dayjs(selectedDate).startOf('month'))
      ? startDay.subtract(7, 'day')
      : startDay;
    const endDay = dayjs(selectedDate).endOf('month').endOf('week').add(offset, 'day');
    const days: dayjs.Dayjs[] = [];
    let curr = adjustedStart;
    while (curr.isBefore(endDay) || curr.isSame(endDay, 'day')) {
      days.push(curr);
      curr = curr.add(1, 'day');
    }
    return days;
  }, [selectedDate, weekStart]);

  const loadData = useCallback(async () => {
    try {
      const startDate = expanded
        ? calendarGrid[0].format('YYYY-MM-DD')
        : weekDays[0].format('YYYY-MM-DD');
      const endDate = expanded
        ? calendarGrid[calendarGrid.length - 1].format('YYYY-MM-DD')
        : weekDays[6].format('YYYY-MM-DD');

      const rangeEntries = await getEntriesByRange(startDate, endDate);

      const groupedScores: Record<
        string,
        Record<number, { total: number; count: number }>
      > = {};

      rangeEntries.forEach((entry) => {
        const date = entry.createdAt.split(' ')[0];
        if (!groupedScores[date]) groupedScores[date] = {};
        entry.emotionResult.topCategories.forEach((cat) => {
          if (!groupedScores[date][cat.categoryId]) {
            groupedScores[date][cat.categoryId] = { total: 0, count: 0 };
          }
          groupedScores[date][cat.categoryId].total += cat.totalScore;
          groupedScores[date][cat.categoryId].count += cat.matchCount;
        });
      });

      const newMap: Record<string, EmotionMap> = {};
      Object.keys(groupedScores).forEach((date) => {
        const scoreEntries = Object.entries(groupedScores[date])
          .map(([id, { total, count }]) => ({
            categoryId: Number(id),
            totalScore: total,
            matchCount: count,
          }))
          .sort((a, b) => b.totalScore - a.totalScore);

        const display = getEmotionDisplay({
          topCategories: scoreEntries.slice(0, 3),
          isNeutral: scoreEntries.length === 0,
        });

        newMap[date] = {
          colors:
            display.colors.length === 1
              ? [display.colors[0], display.colors[0]]
              : display.colors,
          stops: display.colors.length === 1 ? [0, 1] : display.stops,
        };
      });

      setEmotionMap(newMap);
      setEntries(await getEntriesByDate(selectedDate));
    } catch (e) {
      console.error(e);
    }
  }, [selectedDate, expanded, calendarGrid, weekDays]);

  // selectedDate / expanded 변화 + 저장 토큰으로 reload
  useEffect(() => {
    loadData();
  }, [loadData, savedToken]);

  const weekdayLabels =
    weekStart === 'monday'
      ? ['월', '화', '수', '목', '금', '토', '일']
      : ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-neutral-100 dark:bg-neutral-950">
      {/* 달력 헤더 */}
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full justify-center py-2"
          aria-label={expanded ? '주간 보기로 접기' : '월간 보기로 펼치기'}
        >
          <span className="block h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </button>

        <div className="relative mb-3 flex items-center justify-center px-5">
          {expanded && (
            <button
              onClick={() =>
                setSelectedDate(
                  dayjs(selectedDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                )
              }
              className="absolute left-5 text-neutral-400 dark:text-neutral-500"
              aria-label="이전 달"
            >
              ‹
            </button>
          )}

          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {dayjs(selectedDate).format('YYYY년 MM월')}
          </h1>

          {expanded ? (
            <button
              onClick={() =>
                setSelectedDate(
                  dayjs(selectedDate).add(1, 'month').startOf('month').format('YYYY-MM-DD'),
                )
              }
              className="absolute right-5 text-neutral-400 dark:text-neutral-500"
              aria-label="다음 달"
            >
              ›
            </button>
          ) : (
            <button
              onClick={goToToday}
              className="absolute right-5 flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-blue-500 text-[13px] font-extrabold text-white"
              aria-label="오늘로 이동"
            >
              {todayNum}
            </button>
          )}
        </div>

        {!expanded ? (
          <div className="flex justify-around gap-1 px-3 pb-4">
            {weekDays.map((day) => {
              const dateStr = day.format('YYYY-MM-DD');
              const isSelected = dateStr === selectedDate;
              const isFuture = day.isAfter(today, 'day');
              const emotion = emotionMap[dateStr];
              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && setSelectedDate(dateStr)}
                  disabled={isFuture}
                  aria-label={`${day.format('M월 D일 ddd')} 선택`}
                  aria-pressed={isSelected}
                  className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
                    isFuture ? 'opacity-20' : ''
                  } ${isSelected && !emotion ? 'bg-blue-500' : ''} ${
                    isSelected ? 'ring-2 ring-blue-500/40' : ''
                  }`}
                  style={emotion ? { background: toGradient(emotion.colors, emotion.stops) } : undefined}
                >
                  <span
                    className={`text-[11px] ${
                      isSelected && !emotion
                        ? 'text-white/90'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {day.format('ddd')}
                  </span>
                  <span
                    className={`text-base font-semibold ${
                      isSelected && !emotion
                        ? 'text-white'
                        : emotion
                          ? 'text-neutral-900'
                          : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {day.format('D')}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 pb-4">
            <div className="mb-1 grid grid-cols-7">
              {weekdayLabels.map((d) => (
                <span
                  key={d}
                  className="text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-500"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarGrid.map((date) => {
                const dateStr = date.format('YYYY-MM-DD');
                const isSelected = dateStr === selectedDate;
                const isFuture = date.isAfter(today, 'day');
                const isCurrentMonth = date.isSame(dayjs(selectedDate), 'month');
                const emotion = emotionMap[dateStr];
                return (
                  <div key={dateStr} className="p-0.5" style={{ height: 45 }}>
                    <button
                      onClick={() => !isFuture && setSelectedDate(dateStr)}
                      disabled={isFuture}
                      aria-label={`${date.format('M월 D일')} 선택`}
                      aria-pressed={isSelected}
                      className={`relative flex h-full w-full items-center justify-center rounded-lg ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      } ${!isCurrentMonth ? 'opacity-30' : ''} ${isFuture ? 'opacity-10' : ''}`}
                    >
                      {emotion && (
                        <span
                          className="absolute inset-0 rounded-lg"
                          style={{ background: toGradient(emotion.colors, emotion.stops) }}
                        />
                      )}
                      <span
                        className={`relative text-sm ${
                          isSelected ? 'font-bold' : ''
                        } ${emotion ? 'text-neutral-900' : 'text-neutral-900 dark:text-neutral-100'}`}
                      >
                        {date.date()}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 일기 목록 */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-100 p-5 pb-8 dark:bg-neutral-950">
        {entries.length === 0 ? (
          <div className="mt-10 flex flex-col gap-5">
            <div className="self-start rounded-3xl bg-white p-6 dark:bg-neutral-900">
              <p
                className="leading-relaxed text-neutral-600 dark:text-neutral-300"
                style={{ fontSize: FONT_SIZES[fontSize].entry }}
              >
                {selectedDate === todayStr
                  ? '오늘은 무슨 일이 있었나요?'
                  : '이날은 기록이 없네요.\n어떤 하루였나요?'}
              </p>
            </div>
            <button
              onClick={() => openNew(selectedDate)}
              className="rounded-[20px] border-[1.5px] border-dashed border-neutral-300 p-5 text-right text-neutral-400 dark:border-neutral-700 dark:text-neutral-500"
              aria-label="새 일기 작성"
            >
              터치해서 기록하기...
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={openEdit}
              onRefresh={loadData}
            />
          ))
        )}
      </div>
    </div>
  );
}
