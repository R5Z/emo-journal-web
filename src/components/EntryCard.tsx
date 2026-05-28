'use client';

import React, { useState } from 'react';
import { getEmotionDisplay } from '@/domain/emotion/formatter';
import { deleteEntry } from '@/lib/db';
import { useSettingsStore, FONT_SIZES } from '@/store/useSettingsStore';
import { JournalEntry } from '@/types';

interface Props {
  entry: JournalEntry;
  /** 수정: 부모가 에디터 시트를 연다 */
  onEdit: (entry: JournalEntry) => void;
  /** 삭제 후 목록 새로고침 */
  onRefresh: () => void;
}

export default function EntryCard({ entry, onEdit, onRefresh }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { fontSize } = useSettingsStore();
  const { colors } = getEmotionDisplay(entry.emotionResult);

  // "YYYY-MM-DD HH:mm:ss" -> "HH:mm"
  const timeStr = entry.createdAt.split(' ')[1].substring(0, 5);

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(entry);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = window.confirm('정말 삭제하시겠습니까? 삭제된 일기는 복구할 수 없습니다.');
    if (!ok) return;
    try {
      await deleteEntry(entry.id!);
      onRefresh();
    } catch (e) {
      console.error('삭제 실패:', e);
      window.alert('삭제 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="relative mb-3 flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
      {/* 좌측 감정 색상 바 */}
      <div
        className="w-[5px] shrink-0"
        style={{ backgroundColor: colors[0] || 'transparent' }}
      />

      <div className="flex-1 p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
            {timeStr}
          </span>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="px-1 text-xl font-bold leading-none text-neutral-300 dark:text-neutral-600"
            aria-label="일기 옵션 열기"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {'\u22EE'}
          </button>
        </div>

        <p
          className="whitespace-pre-wrap leading-relaxed text-neutral-900 dark:text-neutral-100"
          style={{ fontSize: FONT_SIZES[fontSize].entry }}
        >
          {entry.content}
        </p>
      </div>

      {/* 더보기 메뉴 */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-3 top-10 z-50 w-32 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10"
          >
            <button
              role="menuitem"
              onClick={handleEdit}
              className="block w-full px-5 py-3.5 text-center text-base text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              수정하기
            </button>
            <div className="h-px bg-neutral-100 dark:bg-neutral-700" />
            <button
              role="menuitem"
              onClick={handleDelete}
              className="block w-full px-5 py-3.5 text-center text-base text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              삭제하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
