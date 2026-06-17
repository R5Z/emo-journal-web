'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Profile } from '@/types';

const EMOJI_OPTIONS = [
  '🌿', '🌱', '🌸', '🌼', '🌷', '🌻',
  '🌙', '⭐', '☁️', '🌈', '🔥', '✨',
  '🐣', '🐥', '🐻', '🐰', '🦊', '🐨',
  '🍀', '🍃', '🌊', '🌞', '🌚', '💫',
];

interface Props {
  open: boolean;
  initialProfile: Profile;
  onSave: (profile: Profile) => void;
  onClose: () => void;
}

function ImageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export default function ProfileEditModal({
  open,
  initialProfile,
  onSave,
  onClose,
}: Props) {
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [avatarType, setAvatarType] = useState<Profile['avatarType']>(
    initialProfile.avatarType,
  );
  const [avatarEmoji, setAvatarEmoji] = useState(initialProfile.avatarEmoji);
  const [avatarImageUri, setAvatarImageUri] = useState<string | null>(
    initialProfile.avatarImageUri,
  );
  const [show, setShow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 열릴 때 초기값 재설정 + 슬라이드 인
  useEffect(() => {
    if (open) {
      setNickname(initialProfile.nickname);
      setAvatarType(initialProfile.avatarType);
      setAvatarEmoji(initialProfile.avatarEmoji);
      setAvatarImageUri(initialProfile.avatarImageUri);
      const raf = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(raf);
    }
    setShow(false);
  }, [open, initialProfile]);

  // Esc 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarImageUri(reader.result as string);
      setAvatarType('image');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // 같은 파일 재선택 가능하도록
  };

  const handleSave = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      window.alert('닉네임을 입력해 주세요.');
      return;
    }
    if (trimmed.length > 20) {
      window.alert('닉네임은 20자 이내로 입력해 주세요.');
      return;
    }
    const profile: Profile = {
      nickname: trimmed,
      avatarType,
      avatarEmoji,
      avatarImageUri: avatarType === 'image' ? avatarImageUri : null,
    };
    onSave(profile);
    onClose();
  };

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
        aria-label="프로필 편집"
        className={`relative flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-neutral-100 transition-transform duration-300 ease-out dark:bg-neutral-950 ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3.5 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={onClose}
            className="text-[17px] text-blue-500"
            aria-label="취소"
          >
            취소
          </button>
          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100">
            프로필 편집
          </h2>
          <button
            onClick={handleSave}
            className="text-[17px] font-semibold text-blue-500"
            aria-label="저장"
          >
            저장
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto pb-8">
          {/* 아바타 미리보기 */}
          <div className="flex flex-col items-center py-6">
            {avatarType === 'image' && avatarImageUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarImageUri}
                alt="프로필 미리보기"
                className="h-[100px] w-[100px] rounded-full object-cover"
              />
            ) : (
              <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                <span className="text-[48px] leading-none">{avatarEmoji}</span>
              </div>
            )}

            <button
              onClick={handlePickImage}
              className="mt-3.5 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[15px] font-medium text-blue-500 dark:bg-neutral-900"
            >
              <ImageIcon />
              {avatarImageUri ? '사진 변경' : '사진 선택'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            {avatarType === 'image' && (
              <button
                onClick={() => {
                  setAvatarType('emoji');
                  setAvatarImageUri(null);
                }}
                className="mt-2 text-[13px] text-neutral-400 dark:text-neutral-500"
              >
                이모지로 돌아가기
              </button>
            )}
          </div>

          {/* 닉네임 */}
          <p className="px-4 pb-2 pt-4 text-[13px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            닉네임
          </p>
          <div className="mx-4 rounded-xl bg-white dark:bg-neutral-900">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="닉네임 (최대 20자)"
              className="w-full bg-transparent px-4 py-3 text-[17px] text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              aria-label="닉네임"
            />
          </div>

          {/* 이모지 그리드 */}
          {avatarType === 'emoji' && (
            <>
              <p className="px-4 pb-2 pt-4 text-[13px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                이모지 선택
              </p>
              <div className="mx-4 grid grid-cols-6 gap-1 rounded-xl bg-white p-2 dark:bg-neutral-900">
                {EMOJI_OPTIONS.map((emoji) => {
                  const active = avatarEmoji === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => setAvatarEmoji(emoji)}
                      className={`flex aspect-square items-center justify-center rounded-lg text-[28px] transition-colors ${
                        active
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      aria-pressed={active}
                      aria-label={`이모지 ${emoji} 선택`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
