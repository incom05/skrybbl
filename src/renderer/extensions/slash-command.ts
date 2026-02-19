import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import { SlashMenu, type SlashMenuItem } from '../components/Editor/SlashMenu'

const slashItems: SlashMenuItem[] = [
  {
    title: 'Heading 1',
    icon: 'H1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    }
  },
  {
    title: 'Heading 2',
    icon: 'H2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    }
  },
  {
    title: 'Heading 3',
    icon: 'H3',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    }
  },
  {
    title: 'Bullet List',
    icon: '•',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  {
    title: 'Ordered List',
    icon: '1.',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  {
    title: 'Quote',
    icon: '" "',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    }
  },
  {
    title: 'Code Block',
    icon: '</>',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    }
  },
  {
    title: 'Divider',
    icon: '—',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    }
  },
  {
    title: 'Inline Math',
    icon: 'x²',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'inlineMath', attrs: { latex: '' } })
        .run()
    }
  },
  {
    title: 'Block Math',
    icon: '∫ f',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'blockMath', attrs: { latex: '' } })
        .run()
    }
  },
  {
    title: 'Compute',
    icon: '= ',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'computeField', attrs: { expression: '', result: '', error: '' } })
        .run()
    }
  },
  {
    title: 'Image',
    icon: 'IMG',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      window.electron.pickImage().then((result) => {
        if (result) {
          editor.chain().focus().setImage({ src: result.data, alt: result.name }).run()
        }
      })
    }
  },
  {
    title: 'Graph',
    icon: 'ƒ(x)',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'graphPlot',
          attrs: {
            functions: JSON.stringify([{ expression: 'sin(x)', style: 'solid' }]),
            xDomain: JSON.stringify([-6.28, 6.28]),
            yDomain: JSON.stringify([-2, 2]),
            width: 560,
            height: 300,
            showGrid: true,
            title: ''
          }
        })
        .run()
    }
  }
]

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({
          editor,
          range,
          props
        }: {
          editor: any
          range: any
          props: any
        }) => {
          props.command({ editor, range })
        },
        items: ({ query }: { query: string }) => {
          return slashItems.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: ReactRenderer<any> | null = null
          let popup: TippyInstance[] | null = null

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                offset: [0, 4]
              })
            },
            onUpdate(props: any) {
              component?.updateProps(props)
              if (popup?.[0] && props.clientRect) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect
                })
              }
            },
            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide()
                return true
              }
              return (component?.ref as any)?.onKeyDown?.(props) ?? false
            },
            onExit() {
              popup?.[0]?.destroy()
              component?.destroy()
            }
          }
        }
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})
