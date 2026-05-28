'use client';

import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { analyzeEmotion } from '@/domain/emotion/analyzer';
import { saveEntry, updateEntry } from '@/lib/db';

dayjs.locale('ko');

export interface EditorInitial {
  id?: number;
  content: string;
  date: string; // YYYY-MM-DD
}

interface Props {
  open: boolean;
  initial: EditorInitial | null;
  onClose: () => void;
  /** 저장 성공 시 호출. 부모는 selectedDate 동기화 + 데이터 리로드 */
  onSaved: (date: string) => void;
}

export default function EntryEditorSheet({ open, initial, onClose, onSaved }: Props) {
  const [content, setContent] = useState('');
  const [show, setShow] = useState(false); // 슬라이드 인 애니메이션용
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!initial?.id;
  const date = initial?.date ?? dayjs().format('YYYY-MM-DD');
  const originalContent = initial?.content ?? '';

  // 열릴 때 초기화 + 포커스 + 슬라이드 인
  useEffect(() => {
    if (open && initial) {
      queueMicrotask(() => {
        setContent(initial.content);
      });
      const raf = requestAnimationFrame(() => setShow(true));
      const focusTimer = setTimeout(() => textareaRef.current?.focus(), 120);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(focusTimer);
      };
    }
    queueMicrotask(() => {
      setShow(false);
    });
  }, [open, initial]);

  const isDirty = isEditing ? content !== originalContent : content.trim().length > 0;

  const requestClose = () => {
    if (isDirty) {
      const ok = window.confirm('나가면 작성 중인 내용이 사라집니다. 나가시겠어요?');
      if (!ok) return;
    }
    onClose();
  };

  const handleSave = async () => {
    if (!content.trim()) {
      window.alert('내용을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      const result = analyzeEmotion(content);
      if (isEditing && initial?.id != null) {
        await updateEntry(initial.id, content, result);
      } else {
        await saveEntry(content, result, date);
      }
      onSaved(date);
    } catch (e) {
      console.error('처리 중 에러 발생:', e);
      window.alert('일기를 저장하는 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // Esc 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isDirty, content]);

  if (!open || !initial) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 백드롭 */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={requestClose}
        aria-hidden
      />

      {/* 시트 */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex h-[88vh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-900 ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 그랩 핸들 */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />

        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <button
            onClick={requestClose}
            className="text-base text-neutral-500 dark:text-neutral-400"
            aria-label="작성 취소"
          >
            취소
          </button>

          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100">
            {isEditing ? '일기 수정' : `${dayjs(date).format('MM월 DD일')} 일기`}
          </h2>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
            aria-label={isEditing ? '일기 수정 완료' : '일기 저장'}
          >
            완료
          </button>
        </div>

        {/* 입력 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="지금의 기분이나 상황을 간단히 남겨보세요."
          aria-label="일기 내용 입력"
          className="flex-1 resize-none bg-transparent p-5 text-lg leading-7 text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
      </div>
    </div>
  );
}
