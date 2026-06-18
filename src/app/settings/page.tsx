'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeStore, ThemeMode } from '@/store/useThemeStore';
import { FontSize, WeekStart } from '@/types';
import InfoSheet, { InfoDoc } from '@/components/InfoSheet';


// ============================================
// Labels
// ============================================

const THEME_LABEL: Record<ThemeMode, string> = {
  system: '시스템 연동',
  light: '라이트',
  dark: '다크',
};

const FONT_SIZE_LABEL: Record<FontSize, string> = {
  small: '작게',
  medium: '보통',
  large: '크게',
};

const WEEK_START_LABEL: Record<WeekStart, string> = {
  sunday: '일요일',
  monday: '월요일',
};

// ============================================
// Icons
// ============================================

function ChevronBackIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronForwardIcon() {
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
      className="text-neutral-300 dark:text-neutral-600"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ============================================
// Building blocks
// ============================================

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="px-4 pb-1.5 pt-6 text-[13px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
      {children}
    </h2>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-4 overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
      {children}
    </div>
  );
}

interface RowProps {
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  last?: boolean;
}

function Row({ label, sub, right, onClick, danger, last }: RowProps) {
  const content = (
    <div
      className={`flex min-h-[44px] items-center justify-between px-4 py-2.5 ${
        !last ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
      }`}
    >
      <div className="mr-3 flex-1">
        <p
          className={`text-[17px] ${
            danger ? 'text-red-500' : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-[13px] text-neutral-400 dark:text-neutral-500">
            {sub}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {right}
        {onClick && !right && <ChevronForwardIcon />}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left" aria-label={label}>
        {content}
      </button>
    );
  }
  return content;
}

function ValueText({ children }: { children: string }) {
  return (
    <span className="text-[17px] text-neutral-400 dark:text-neutral-500">
      {children}
    </span>
  );
}

// ============================================
// Option Picker Modal
// ============================================

interface Option<T> {
  value: T;
  label: string;
}

function OptionPickerModal<T extends string | number>({
  open,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  options: Option<T>[];
  selected: T;
  onSelect: (v: T) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-900"
      >
        <h3 className="px-4 pb-3 pt-4 text-center text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        {options.map((opt, i) => (
          <button
            key={String(opt.value)}
            onClick={() => {
              onSelect(opt.value);
              onClose();
            }}
            className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${
              i < options.length - 1
                ? 'border-b border-neutral-100 dark:border-neutral-800'
                : ''
            } hover:bg-neutral-50 dark:hover:bg-neutral-800`}
          >
            <span className="text-base text-neutral-900 dark:text-neutral-100">
              {opt.label}
            </span>
            {opt.value === selected && <CheckIcon />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main
// ============================================

export default function SettingsPage() {
  const router = useRouter();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const weekStart = useSettingsStore((s) => s.weekStart);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setWeekStart = useSettingsStore((s) => s.setWeekStart);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const [themeOpen, setThemeOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [weekStartOpen, setWeekStartOpen] = useState(false);
  const [infoDoc, setInfoDoc] = useState<InfoDoc | null>(null);

  const notReady = (label: string) =>
    window.alert(`${label}은(는) 준비 중이에요.`);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-neutral-100 dark:bg-neutral-950">
      {/* 헤더 */}
      <header className="flex items-center justify-between bg-neutral-100 px-4 pb-2.5 pt-3 dark:bg-neutral-950">
        <button
          onClick={() => router.back()}
          className="flex w-[60px] items-center gap-0.5 text-blue-500"
          aria-label="뒤로 이동"
        >
          <ChevronBackIcon />
          <span className="text-[17px]">MY</span>
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          설정
        </h1>
        <span className="w-[60px]" />
      </header>

      {/* 본문 */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-10">
        {/* 앱 설정 */}
        <SectionLabel>앱 설정</SectionLabel>
        <Group>
          <Row
            label="테마"
            right={<ValueText>{THEME_LABEL[themeMode]}</ValueText>}
            onClick={() => setThemeOpen(true)}
          />
          <Row
            label="글꼴 크기"
            right={<ValueText>{FONT_SIZE_LABEL[fontSize]}</ValueText>}
            onClick={() => setFontSizeOpen(true)}
          />
          <Row
            label="캘린더 시작 요일"
            right={<ValueText>{WEEK_START_LABEL[weekStart]}</ValueText>}
            onClick={() => setWeekStartOpen(true)}
            last
          />
        </Group>

        {/* 지원 및 정보 */}
        <SectionLabel>지원 및 정보</SectionLabel>
        <Group>
          <Row label="자주 묻는 질문" onClick={() => setInfoDoc('faq')} />
          <Row label="피드백 보내기" onClick={() => notReady('피드백 페이지')} />
          <Row label="개인정보 처리방침" onClick={() => setInfoDoc('privacy')} />
          <Row label="서비스 이용약관" onClick={() => setInfoDoc('terms')} />
          <Row label="오픈소스 라이선스" onClick={() => setInfoDoc('licenses')} />
        </Group>
      </div>

      {/* Modals */}
      <OptionPickerModal
        open={themeOpen}
        title="테마"
        options={[
          { value: 'system' as const, label: '시스템 연동' },
          { value: 'light' as const, label: '라이트' },
          { value: 'dark' as const, label: '다크' },
        ]}
        selected={themeMode}
        onSelect={setThemeMode}
        onClose={() => setThemeOpen(false)}
      />

      <OptionPickerModal
        open={fontSizeOpen}
        title="글꼴 크기"
        options={[
          { value: 'small' as const, label: '작게' },
          { value: 'medium' as const, label: '보통' },
          { value: 'large' as const, label: '크게' },
        ]}
        selected={fontSize}
        onSelect={setFontSize}
        onClose={() => setFontSizeOpen(false)}
      />

      <OptionPickerModal
        open={weekStartOpen}
        title="캘린더 시작 요일"
        options={[
          { value: 'sunday' as const, label: '일요일' },
          { value: 'monday' as const, label: '월요일' },
        ]}
        selected={weekStart}
        onSelect={setWeekStart}
        onClose={() => setWeekStartOpen(false)}
      />

      <InfoSheet
        open={infoDoc !== null}
        initialDoc={infoDoc}
        onClose={() => setInfoDoc(null)}
      />
    </div>
  );
}
