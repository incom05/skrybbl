import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { GraphPlotView } from '../components/Graph/GraphPlotView'

export const GraphPlot = Node.create({
  name: 'graphPlot',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      functions: { default: JSON.stringify([{ expression: 'sin(x)', style: 'solid' }]) },
      xDomain: { default: JSON.stringify([-6.28, 6.28]) },
      yDomain: { default: JSON.stringify([-2, 2]) },
      width: { default: 560 },
      height: { default: 300 },
      showGrid: { default: true },
      title: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-graph-plot]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-graph-plot': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GraphPlotView)
  }
})
