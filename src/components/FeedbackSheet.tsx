'use client';

import React, { useEffect, useRef, useState } from 'react';

// ============================================
// 설정
// ============================================

const TALLY_SRC =
  'https://tally.so/embed/J9GKL4?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

const FEEDBACK_EMAIL = 'hey@yoonjang.me';
const TALLY_EMBED_SCRIPT = 'https://tally.so/widgets/embed.js';

// Tally 전역 타입
declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  );
}

export default function FeedbackSheet({ open, onClose }: Props) {
  const [show, setShow] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 슬라이드 인 + Tally 임베드 로드
  useEffect(() => {
    if (!open) {
      setShow(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShow(true));

    const wireEmbed = () => {
      if (window.Tally) {
        window.Tally.loadEmbeds();
      } else {
        // 스크립트 실패 시 수동으로 src 주입 (높이 자동조절은 안 되지만 폼은 뜸)
        document
          .querySelectorAll<HTMLIFrameElement>('iframe[data-tally-src]:not([src])')
          .forEach((el) => {
            el.src = el.dataset.tallySrc || '';
          });
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TALLY_EMBED_SCRIPT}"]`,
    );
    if (existing) {
      wireEmbed();
    } else {
      const script = document.createElement('script');
      script.src = TALLY_EMBED_SCRIPT;
      script.onload = wireEmbed;
      script.onerror = wireEmbed;
      document.body.appendChild(script);
    }

    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Esc 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const mailtoHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    '[감정일기 Vhue 피드백]',
  )}&body=${encodeURIComponent('자유롭게 의견을 남겨주세요.\n\n---\n앱 버전: v1.0.0')}`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 백드롭 */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* 시트 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="피드백"
        className={`relative flex h-[92dvh] flex-col overflow-hidden rounded-t-2xl bg-neutral-100 transition-transform duration-300 ease-out dark:bg-neutral-950 ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 그랩 핸들 */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />

        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="text-[17px] text-blue-500"
            aria-label="닫기"
          >
            닫기
          </button>
          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100">
            피드백 보내기
          </h2>
          <span className="w-[40px]" aria-hidden />
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto">
          {/* 인트로 + 메일 링크 */}
          <div className="px-5 pb-2 pt-5">
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              감정 일기 앱 뷰Vhue의 웹 버전입니다.<br/> 
              혼자 쓰려고 만들었지만, 이 앱이 필요한 분이 더 있을 수도 있을 것 같아 출시를 염두에 두고 있어요.<br/>  
              출시 전 어떤 방향으로 다듬어가면 좋을지 알고 싶어서 짧은 설문을 준비했습니다.<br/> 
              정답은 없으니 편하게 답해 주시면 큰 도움이 됩니다! (익명 / 약 3분) 
            </p>

            <a
              href={mailtoHref}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-neutral-400 underline-offset-2 hover:underline dark:text-neutral-500"
            >
              <MailIcon />
              설문 대신 메일로 한 마디 보내기
            </a>
          </div>

          {/* Tally 임베드 */}
          <div className="px-3 pb-8">
            <iframe
              ref={iframeRef}
              data-tally-src={TALLY_SRC}
              loading="lazy"
              width="100%"
              height={500}
              title="감정 일기 Vhue 피드백 설문"
              className="w-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
