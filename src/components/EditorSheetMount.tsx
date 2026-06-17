'use client';

import EntryEditorSheet from './EntryEditorSheet';
import { useDateStore } from '@/store/useDateStore';
import { useEditorStore } from '@/store/useEditorStore';

export default function EditorSheetMount() {
  const open = useEditorStore((s) => s.open);
  const initial = useEditorStore((s) => s.initial);
  const close = useEditorStore((s) => s.close);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setSelectedDate = useDateStore((s) => s.setSelectedDate);

  return (
    <EntryEditorSheet
      open={open}
      initial={initial}
      onClose={close}
      onSaved={(date) => {
        setSelectedDate(date);
        markSaved();
        close();
      }}
    />
  );
}
