import { BrowserWindow } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
}

const stateFile = (): string => join(app.getPath('userData'), 'window-state.json')

export function loadWindowState(): WindowState {
  try {
    const data = readFileSync(stateFile(), 'utf-8')
    return JSON.parse(data)
  } catch {
    return { width: 1200, height: 800 }
  }
}

export function saveWindowState(win: BrowserWindow): void {
  const bounds = win.getBounds()
  const state: WindowState = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y
  }
  try {
    mkdirSync(join(app.getPath('userData')), { recursive: true })
    writeFileSync(stateFile(), JSON.stringify(state))
  } catch {
    // Ignore write errors
  }
}
