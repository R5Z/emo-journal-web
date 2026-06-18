'use client';

import React, { useEffect, useState } from 'react';

// ============================================
// Types
// ============================================

export type InfoDoc = 'faq' | 'privacy' | 'terms' | 'licenses';

interface Props {
  open: boolean;
  initialDoc: InfoDoc | null;
  onClose: () => void;
}

const DOC_LABELS: Record<InfoDoc, string> = {
  faq: '자주 묻는 질문',
  privacy: '개인정보 처리방침',
  terms: '서비스 이용약관',
  licenses: '오픈소스 라이선스',
};

// ============================================
// Data
// ============================================

const FAQ_DATA = [
  {
    question: '감정은 어떻게 분석되나요?',
    answer:
      '작성하신 일기에서 감정 키워드를 자동으로 인식해 21개의 감정 카테고리로 분류합니다. 직접 감정을 선택할 필요 없이, 자연스럽게 쓴 글에서 감정을 읽어냅니다.',
  },
  {
    question: '하루에 여러 개의 일기를 쓸 수 있나요?',
    answer:
      '네, 하루에 원하는 만큼 기록할 수 있습니다. 각 기록마다 감정이 따로 분석되고, 달력에는 그날의 전체 감정이 종합되어 표시됩니다.',
  },
  {
    question: '내 일기 데이터는 안전한가요?',
    answer:
      '모든 데이터는 기기 내에만 저장되며, 외부 서버로 전송되지 않습니다. 후 앱 버전의 경우 앱 잠금(Face ID/PIN) 기능을 사용하면 다른 사람이 앱을 열어볼 수 없습니다.',
  },
  {
    question: '데이터를 백업할 수 있나요?',
    answer:
      '앱 버전에서 설정 → 데이터 및 동기화에서 JSON 또는 PDF 형식으로 내보낼 수 있습니다. JSON 파일은 다시 앱으로 가져올 수 있어 기기 변경 시에도 데이터를 유지할 수 있습니다.',
  },
  {
    question: '감정 색상은 어떤 기준인가요?',
    answer:
      '플루치크(Plutchik)의 감정 이론을 기반으로 21개 감정 카테고리에 각각 고유한 색상을 부여했습니다. 마이페이지 하단의 감정 카테고리에서 전체 목록을 확인할 수 있습니다.',
  },
  {
    question: '달력에 표시되는 색은 무엇인가요?',
    answer:
      '그날 작성한 일기에서 감지된 감정의 색상입니다. 여러 감정이 감지되면 그라데이션으로 표시됩니다. 색이 없는 날은 기록이 없는 날입니다.',
  },
  {
    question: '앱을 삭제하면 데이터도 사라지나요?',
    answer:
      '네, 모든 데이터가 기기 내에 저장되므로 앱을 삭제하면 데이터도 함께 삭제됩니다. 중요한 기록은 미리 내보내기(백업)해 두시는 것을 권장합니다. 현재 웹 버전의 경우 브라우저의 로컬 스토리지에 데이터를 저장하므로, 브라우저 캐시를 삭제하면 데이터가 사라질 수 있습니다.',
  },
  {
    question: '프리미엄 기능에는 어떤 것이 있나요?',
    answer:
      '감정 컬러 팔레트 커스텀, 나만의 감정 키워드 추가 등을 준비하고 있습니다. 향후 앱 출시 후 업데이트에서 제공될 예정입니다.',
  },
];

const PRIVACY_POLICY = `개인정보 처리방침

앱 버전 최종 수정일: 2026년 6월 1일

1. 수집하는 개인정보

본 앱은 사용자가 직접 입력한 일기 내용과 앱 설정 정보만을 저장합니다. 수집되는 정보는 다음과 같습니다:

• 일기 내용 (텍스트)
• 작성 일시
• 앱 설정 (알림 시간, 잠금 설정 등)
• 프로필 정보 (닉네임, 아바타)

2. 개인정보의 저장 및 보호

모든 데이터는 사용자의 기기 내에서만 저장되며, 외부 서버로 전송되지 않습니다. 앱 잠금 기능(Face ID, PIN)을 통해 타인의 접근을 방지할 수 있습니다.

3. 개인정보의 제3자 제공

본 앱은 사용자의 개인정보를 제3자에게 제공하지 않습니다.

4. 개인정보의 파기

앱을 삭제하면 기기에 저장된 모든 데이터가 함께 삭제됩니다. 설정 메뉴의 '전체 데이터 삭제' 기능을 통해 앱 내에서도 데이터를 삭제할 수 있습니다.

5. 이용자의 권리

사용자는 언제든지 자신의 데이터를 내보내거나 삭제할 수 있습니다. 데이터 내보내기는 설정 → 데이터 및 동기화에서 이용할 수 있습니다.

6. 문의

개인정보 관련 문의사항은 앱 내 '피드백 보내기'를 이용해 주세요.`;

const TERMS_OF_SERVICE = `서비스 이용약관

최종 수정일: 2026년 6월 1일

제1조 (목적)

본 약관은 감정 일기 앱(이하 "서비스")의 이용과 관련하여 필요한 사항을 규정함을 목적으로 합니다.

제2조 (서비스의 내용)

서비스는 사용자가 작성한 일기에서 감정을 자동으로 인식하고 시각화하는 기능을 제공합니다. 주요 기능은 다음과 같습니다:

• 일기 작성 및 관리
• 감정 키워드 자동 인식
• 감정 컬러 시각화 (달력, 타임라인)
• 감정 흐름 대시보드
• 데이터 내보내기/가져오기

제3조 (이용자의 의무)

1. 이용자는 본 서비스를 개인적인 목적으로만 사용해야 합니다.
2. 이용자는 자신의 데이터 백업에 대한 책임을 가집니다.

제4조 (서비스의 변경 및 중단)

1. 서비스는 기능 개선을 위해 사전 고지 후 변경될 수 있습니다.
2. 천재지변, 기술적 문제 등 불가피한 사유로 서비스가 일시 중단될 수 있습니다.

제5조 (면책사항)

1. 서비스의 감정 분석 결과는 참고 목적이며, 전문적인 심리 상담이나 의료 행위를 대체하지 않습니다.
2. 기기 손상, 앱 삭제 등으로 인한 데이터 손실에 대해 서비스 제공자는 책임지지 않습니다.

제6조 (약관의 변경)

본 약관은 관련 법령 변경 또는 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.`;

// TODO: package.json 확인 후 실제 의존성으로 교체
const LICENSES = [
  { name: 'Next.js', license: 'MIT', url: 'https://github.com/vercel/next.js' },
  { name: 'React', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'TypeScript', license: 'Apache-2.0', url: 'https://github.com/microsoft/TypeScript' },
  { name: 'Tailwind CSS', license: 'MIT', url: 'https://github.com/tailwindlabs/tailwindcss' },
  { name: 'Zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: 'Dexie.js', license: 'Apache-2.0', url: 'https://github.com/dexie/Dexie.js' },
  { name: 'Day.js', license: 'MIT', url: 'https://github.com/iamkun/dayjs' },
];

// ============================================
// Icons
// ============================================

function FolderIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronDownIcon({ open, size = 14 }: { open: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-400 dark:text-neutral-500"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ============================================
// Content components
// ============================================

function FAQContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
      {FAQ_DATA.map((item, i) => {
        const isOpen = openIndex === i;
        const isLast = i === FAQ_DATA.length - 1;
        return (
          <div
            key={i}
            className={
              !isLast ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
            }
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              aria-expanded={isOpen}
            >
              <span className="mr-3 flex-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
                {item.question}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">
                <ChevronDownIcon open={isOpen} size={18} />
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-3.5">
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LegalDoc({ content }: { content: string }) {
  return (
    <div className="px-4 py-4">
      <div className="rounded-xl bg-white p-5 dark:bg-neutral-900">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {content}
        </p>
      </div>
      <p className="mt-4 text-center text-xs italic text-neutral-400 dark:text-neutral-600">
        본 문서는 임시 작성본이며, 정식 출시 전 법률 검토를 거쳐 교체될 예정입니다.
      </p>
    </div>
  );
}

function LicensesContent() {
  return (
    <div className="px-4 py-4">
      <p className="pb-3 text-[13px] text-neutral-500 dark:text-neutral-400">
        이 앱은 아래의 오픈소스 라이브러리를 사용하고 있습니다.
      </p>
      <div className="overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
        {LICENSES.map((lib, i) => {
          const isLast = i === LICENSES.length - 1;
          return (
            <a
              key={lib.name}
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-4 py-3 ${
                !isLast ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
              } hover:bg-neutral-50 dark:hover:bg-neutral-800`}
            >
              <div className="flex-1">
                <p className="text-base text-neutral-900 dark:text-neutral-100">
                  {lib.name}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                  {lib.license} License
                </p>
              </div>
              <ExternalLinkIcon />
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Main
// ============================================

export default function InfoSheet({ open, initialDoc, onClose }: Props) {
  const [doc, setDoc] = useState<InfoDoc>(initialDoc ?? 'faq');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open && initialDoc) {
      setDoc(initialDoc);
      const raf = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(raf);
    }
    setShow(false);
    setDropdownOpen(false);
  }, [open, initialDoc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
        className={`relative flex h-[90dvh] flex-col overflow-hidden rounded-t-2xl bg-neutral-100 transition-transform duration-300 ease-out dark:bg-neutral-950 ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 그랩 핸들 */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />

        {/* 헤더 */}
        <div className="relative flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="text-[17px] text-blue-500"
            aria-label="닫기"
          >
            닫기
          </button>

          {/* 드롭다운 트리거 + 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <FolderIcon />
              <span className="text-[15px] font-semibold">{DOC_LABELS[doc]}</span>
              <ChevronDownIcon open={dropdownOpen} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                  aria-hidden
                />
                <div
                  role="menu"
                  className="absolute left-1/2 top-full z-20 mt-1 w-56 -translate-x-1/2 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10"
                >
                  {(Object.keys(DOC_LABELS) as InfoDoc[]).map((key) => {
                    const active = key === doc;
                    return (
                      <button
                        key={key}
                        role="menuitem"
                        onClick={() => {
                          setDoc(key);
                          setDropdownOpen(false);
                        }}
                        className={`block w-full px-4 py-3 text-left text-[15px] hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                          active
                            ? 'bg-neutral-50 font-semibold text-blue-500 dark:bg-neutral-700'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {DOC_LABELS[key]}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 우측 공간 (균형용) */}
          <span className="w-[40px]" aria-hidden />
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto pb-8">
          {doc === 'faq' && <FAQContent />}
          {doc === 'privacy' && <LegalDoc content={PRIVACY_POLICY} />}
          {doc === 'terms' && <LegalDoc content={TERMS_OF_SERVICE} />}
          {doc === 'licenses' && <LicensesContent />}
        </div>
      </div>
    </div>
  );
}
