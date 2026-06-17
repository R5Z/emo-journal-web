'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { getEmotionDisplay } from '@/domain/emotion/formatter';
import { deleteEntry } from '@/lib/db';
import { useSettingsStore, FONT_SIZES } from '@/store/useSettingsStore';
import { JournalEntry } from '@/types';

interface Props {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onRefresh: () => void;
}

const MENU_WIDTH = 128; // w-32
const MENU_HEIGHT = 96; // 대략 (수정 + divider + 삭제)
const EDGE_PADDING = 12;

export default function EntryCard({ entry, onEdit, onRefresh }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { fontSize } = useSettingsStore();
  const { colors } = getEmotionDisplay(entry.emotionResult);

  const timeStr = entry.createdAt.split(' ')[1].substring(0, 5);

  // 메뉴 열릴 때 트리거 버튼 좌표 기준으로 위치 계산
  useLayoutEffect(() => {
    if (!menuOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // 기본: 버튼 아래, 오른쪽 정렬
    let top = rect.bottom + 4;
    let left = rect.right - MENU_WIDTH;

    // 아래로 못 들어가면 위로
    if (top + MENU_HEIGHT > viewportH - EDGE_PADDING) {
      top = rect.top - MENU_HEIGHT - 4;
    }
    // 좌우 클램프
    if (left < EDGE_PADDING) left = EDGE_PADDING;
    if (left + MENU_WIDTH > viewportW - EDGE_PADDING) {
      left = viewportW - MENU_WIDTH - EDGE_PADDING;
    }

    setMenuPos({ top, left });
  }, [menuOpen]);

  // 스크롤/리사이즈 시 닫기 (위치 어긋남 방지)
  useLayoutEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuOpen]);

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
    <div className="mb-3 flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
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
            ref={triggerRef}
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

      {/* 메뉴 — fixed로 띄워서 카드 overflow에 안 잘림 */}
      {menuOpen && menuPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="fixed z-50 w-32 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10"
            style={{ top: menuPos.top, left: menuPos.left }}
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
