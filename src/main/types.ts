import type { JSONContent } from '@tiptap/core'

export interface Page {
  id: string
  title: string
  content: JSONContent
  createdAt: string
  updatedAt: string
}

export interface Notebook {
  version: number
  title: string
  pages: Page[]
  activePageId: string
  createdAt: string
  updatedAt: string
}
