import { create } from 'zustand'

interface EditorStats {
  words: number
  chars: number
  setStats: (words: number, chars: number) => void
}

export const useEditorStats = create<EditorStats>((set) => ({
  words: 0,
  chars: 0,
  setStats: (words, chars) => set({ words, chars })
}))
