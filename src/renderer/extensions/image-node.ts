import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ImageNodeView } from '../components/Image/ImageNodeView'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const ImageNode = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null }
    }
  },

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey('imageDropPaste'),
        props: {
          handlePaste(_view, event) {
            const items = event.clipboardData?.items
            if (!items) return false

            for (const item of items) {
              if (item.type.startsWith('image/')) {
                event.preventDefault()
                const file = item.getAsFile()
                if (!file) return false

                fileToBase64(file).then((src) => {
                  editor.chain().focus().setImage({ src, alt: file.name }).run()
                })
                return true
              }
            }
            return false
          },

          handleDrop(_view, event) {
            const files = event.dataTransfer?.files
            if (!files?.length) return false

            const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
            if (!imageFiles.length) return false

            event.preventDefault()
            for (const file of imageFiles) {
              fileToBase64(file).then((src) => {
                editor.chain().focus().setImage({ src, alt: file.name }).run()
              })
            }
            return true
          }
        }
      })
    ]
  }
})
