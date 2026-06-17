'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAllEntries } from '@/lib/db';
import { loadProfile, saveProfile } from '@/lib/profile';
import { calculateStreaks, getFirstRecordDate, StreakStats } from '@/lib/streak';
import { DEFAULT_PROFILE, JournalEntry, Profile } from '@/types';
import { useEditorStore } from '@/store/useEditorStore';
import EmotionFlowDashboard from '@/components/EmotionFlowDashboard';
import ProfileEditModal from '@/components/ProfileEditModal';
import { useRouter } from 'next/navigation';


function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-600 dark:text-neutral-300"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function MyPage() {
  const router = useRouter();

  const [stats, setStats] = useState<StreakStats>({ current: 0, longest: 0, total: 0 });
  const [joinDate, setJoinDate] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [editOpen, setEditOpen] = useState(false);
  const savedToken = useEditorStore((s) => s.savedToken);

  const loadData = useCallback(async () => {
    try {
      const [allEntries, savedProfile] = await Promise.all([
        getAllEntries(),
        loadProfile(),
      ]);
      setEntries(allEntries);
      setStats(calculateStreaks(allEntries));
      setProfile(savedProfile);
      setJoinDate(getFirstRecordDate(allEntries));
    } catch (e) {
      console.error('Failed to load profile data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, savedToken]);

  const handleSaveProfile = async (newProfile: Profile) => {
    try {
      await saveProfile(newProfile);
      setProfile(newProfile);
    } catch (e) {
      console.error('Failed to save profile:', e);
      window.alert('프로필 저장 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-neutral-100 pb-8 dark:bg-neutral-950">
      {/* 헤더 */}
      <header className="flex items-center justify-between bg-neutral-100 px-4 pb-2.5 pt-3 dark:bg-neutral-950">
        <span className="h-[30px] w-[30px]" />
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          마이 페이지
        </h1>
        <button
          onClick={() => router.push('/settings')}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
          aria-label="설정"
        >
          <SettingsIcon />
        </button>
      </header>

      {/* 프로필 카드 */}
      <div className="mx-4 mb-2 rounded-xl bg-white p-4 dark:bg-neutral-900">
        <div className="flex items-center">
          {profile.avatarType === 'image' && profile.avatarImageUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarImageUri}
              alt={`${profile.nickname} 프로필 이미지`}
              className="h-[60px] w-[60px] rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
              aria-label={`${profile.nickname} 프로필 아바타`}
            >
              <span className="text-[28px] leading-none">{profile.avatarEmoji}</span>
            </div>
          )}
          <div className="ml-3.5 flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {profile.nickname}
            </h2>
            {joinDate && (
              <p className="mt-0.5 text-[13px] text-neutral-400 dark:text-neutral-500">
                {joinDate}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-[15px] font-medium text-blue-500 dark:bg-neutral-800"
            aria-label="프로필 편집"
          >
            편집
          </button>
        </div>
      </div>

      {/* 스트릭 통계 */}
      <div className="mx-4 mb-4 flex gap-2">
        {[
          { value: stats.current, label: '연속 기록', icon: '🔥' },
          { value: stats.longest, label: '최장', icon: '✨' },
          { value: stats.total, label: '총 기록', icon: '📝' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col items-center rounded-xl bg-white py-3 dark:bg-neutral-900"
          >
            <span className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100">
              {item.value}
            </span>
            <span className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
              {item.label} {item.icon}
            </span>
          </div>
        ))}
      </div>

      {/* 감정 흐름 + 카테고리 범례 */}
      <EmotionFlowDashboard entries={entries} />

      {/* 프로필 편집 모달 */}
      <ProfileEditModal
        open={editOpen}
        initialProfile={profile}
        onSave={handleSaveProfile}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
