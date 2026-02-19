import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

export interface RecentFile {
  path: string
  title: string
  updatedAt: string
  pageCount: number
  icon?: string
  color?: string
}

const MAX_RECENT = 20

const recentFile = (): string => join(app.getPath('userData'), 'recent-files.json')

function save(files: RecentFile[]): void {
  try {
    mkdirSync(join(app.getPath('userData')), { recursive: true })
    writeFileSync(recentFile(), JSON.stringify(files, null, 2))
  } catch {
    // Ignore write errors
  }
}

export function loadRecentFiles(): RecentFile[] {
  try {
    const data = readFileSync(recentFile(), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function addRecentFile(entry: RecentFile): void {
  const existing = loadRecentFiles()
  // Preserve icon/color from existing entry if not provided
  const old = existing.find((f) => f.path === entry.path)
  const merged: RecentFile = {
    ...entry,
    icon: entry.icon ?? old?.icon,
    color: entry.color ?? old?.color
  }
  const files = existing.filter((f) => f.path !== entry.path)
  files.unshift(merged)
  if (files.length > MAX_RECENT) files.length = MAX_RECENT
  save(files)
}

export function removeRecentFile(path: string): void {
  const files = loadRecentFiles().filter((f) => f.path !== path)
  save(files)
}

export function updateRecentFile(path: string, updates: Partial<Pick<RecentFile, 'title' | 'icon' | 'color'>>): void {
  const files = loadRecentFiles().map((f) => {
    if (f.path !== path) return f
    return { ...f, ...updates }
  })
  save(files)
}

export function reorderRecentFiles(orderedPaths: string[]): void {
  const files = loadRecentFiles()
  const byPath = new Map(files.map((f) => [f.path, f]))
  const reordered: RecentFile[] = []
  for (const p of orderedPaths) {
    const f = byPath.get(p)
    if (f) {
      reordered.push(f)
      byPath.delete(p)
    }
  }
  // Append any remaining files not in the order list
  for (const f of byPath.values()) reordered.push(f)
  save(reordered)
}
