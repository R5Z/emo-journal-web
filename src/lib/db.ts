import Dexie, { type EntityTable } from 'dexie';
import { AnalysisResult } from '@/types';

// ============================================
// Types
// ============================================

export interface EntryRecord {
  id?: number;
  content: string;
  emotionResult: string; // JSON string
  createdAt: string;     // "YYYY-MM-DD HH:mm:ss"
}

export interface JournalEntryParsed {
  id?: number;
  content: string;
  emotionResult: {
    topCategories: { categoryId: number; totalScore: number; matchCount: number }[];
    isNeutral: boolean;
  };
  createdAt: string;
}

// ============================================
// Database
// ============================================

const db = new Dexie('journal') as Dexie & {
  entries: EntityTable<EntryRecord, 'id'>;
};

db.version(1).stores({
  entries: '++id, createdAt',
});

// ============================================
// Helpers
// ============================================

function parseEntry(record: EntryRecord): JournalEntryParsed {
  let emotionResult = { topCategories: [], isNeutral: true };
  try {
    emotionResult = JSON.parse(record.emotionResult);
  } catch {
    // fallback
  }
  return {
    id: record.id,
    content: record.content,
    emotionResult,
    createdAt: record.createdAt,
  };
}

// ============================================
// CRUD
// ============================================

export async function initDB(): Promise<void> {
  // Dexie auto-opens, no explicit init needed
}

export async function saveEntry(
  content: string,
  emotionResult: Pick<AnalysisResult, 'topCategories' | 'isNeutral'>,
  targetDate: string,
): Promise<number> {
  const now = new Date();
  const timePart = now.toTimeString().split(' ')[0];
  const createdAt = `${targetDate} ${timePart}`;

  const id = await db.entries.add({
    content,
    emotionResult: JSON.stringify(emotionResult),
    createdAt,
  });

  return id as number;
}

export async function updateEntry(
  id: number,
  content: string,
  emotionResult: Pick<AnalysisResult, 'topCategories' | 'isNeutral'>,
): Promise<number> {
  return await db.entries.update(id, {
    content,
    emotionResult: JSON.stringify(emotionResult),
  });
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id);
}

export async function getAllEntries(): Promise<JournalEntryParsed[]> {
  const records = await db.entries
    .orderBy('createdAt')
    .reverse()
    .toArray();
  return records.map(parseEntry);
}

export async function getEntriesByDate(
  dateStr: string,
): Promise<JournalEntryParsed[]> {
  const records = await db.entries
    .where('createdAt')
    .startsWith(dateStr)
    .sortBy('createdAt');
  return records.map(parseEntry);
}

export async function getEntriesByRange(
  startDate: string,
  endDate: string,
): Promise<JournalEntryParsed[]> {
  const records = await db.entries
    .where('createdAt')
    .between(startDate, endDate + '\uffff', true, true)
    .sortBy('createdAt');
  return records.map(parseEntry);
}
