import { create } from 'zustand'

export interface Command {
  id: string
  title: string
  subtitle?: string
  category: string
  keywords: string[]
  action: () => void
}

interface CommandStore {
  commands: Command[]
  register: (commands: Command[]) => void
  unregister: (ids: string[]) => void
}

export const useCommandStore = create<CommandStore>((set) => ({
  commands: [],
  register: (newCommands) =>
    set((s) => ({
      commands: [
        ...s.commands.filter((c) => !newCommands.some((nc) => nc.id === c.id)),
        ...newCommands
      ]
    })),
  unregister: (ids) =>
    set((s) => ({ commands: s.commands.filter((c) => !ids.includes(c.id)) }))
}))
