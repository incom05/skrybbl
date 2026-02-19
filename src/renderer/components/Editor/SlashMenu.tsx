import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback
} from 'react'
import type { Editor, Range } from '@tiptap/core'

export interface SlashMenuItem {
  title: string
  icon: string
  command: (props: { editor: Editor; range: Range }) => void
}

interface SlashMenuProps {
  items: SlashMenuItem[]
  command: (item: SlashMenuItem) => void
  editor: Editor
}

export const SlashMenu = forwardRef<any, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index]
        if (item) command(item)
      },
      [items, command]
    )

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      }
    }))

    if (items.length === 0) return null

    return (
      <div className="slash-menu">
        {items.map((item, index) => (
          <button
            key={item.title}
            className={`slash-menu-item ${index === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className="slash-menu-item-icon">{item.icon}</span>
            <span className="slash-menu-item-label">{item.title}</span>
          </button>
        ))}
      </div>
    )
  }
)

SlashMenu.displayName = 'SlashMenu'
