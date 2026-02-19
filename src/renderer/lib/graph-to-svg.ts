import { loadFunctionPlot } from '../components/Graph/GraphRenderer'
import type { Notebook } from '../types'

export type GraphSvgMap = Map<number, string>

// Hardcoded colors for export (dark on white background)
const EXPORT_COLORS = {
  line: '#1a1a1a',
  axis: '#333333',
  tick: '#555555',
  grid: '#e0e0e0'
}

/**
 * Pre-render all graphPlot nodes in a notebook to SVG strings
 * using print-friendly colors (black lines on white background).
 */
export async function renderAllGraphSvgs(notebook: Notebook): Promise<GraphSvgMap> {
  const map: GraphSvgMap = new Map()
  const graphNodes: { key: number; attrs: Record<string, any> }[] = []

  let idx = 0
  for (const page of notebook.pages) {
    if (page.content?.content) {
      for (const node of page.content.content) {
        if (node.type === 'graphPlot') {
          graphNodes.push({ key: idx, attrs: node.attrs || {} })
        }
        idx++
      }
    }
  }

  if (graphNodes.length === 0) return map

  let fp: any
  try {
    const mod = await loadFunctionPlot()
    fp = mod.default || mod
  } catch {
    return map
  }

  for (const { key, attrs } of graphNodes) {
    try {
      const functions = JSON.parse(attrs.functions || '[]')
      const xDomain = JSON.parse(attrs.xDomain || '[-6.28,6.28]')
      const yDomain = JSON.parse(attrs.yDomain || '[-2,2]')
      const width = attrs.width || 560
      const height = attrs.height || 300
      const showGrid = attrs.showGrid !== false

      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      document.body.appendChild(container)

      // Render with export-safe black line colors
      fp({
        target: container,
        width,
        height,
        xAxis: { domain: xDomain },
        yAxis: { domain: yDomain },
        grid: showGrid,
        data: functions
          .filter((f: { expression: string }) => f.expression.trim())
          .map((f: { expression: string }) => ({
            fn: f.expression,
            graphType: 'polyline' as const,
            color: EXPORT_COLORS.line
          }))
      })

      // Style SVG for print (dark on white)
      const svg = container.querySelector('svg')
      if (svg) {
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttribute('width', String(width))
        svg.setAttribute('height', String(height))

        svg.querySelectorAll('.domain').forEach((n) => {
          ;(n as SVGElement).style.stroke = EXPORT_COLORS.axis
        })
        svg.querySelectorAll('.tick line').forEach((n) => {
          ;(n as SVGElement).style.stroke = EXPORT_COLORS.axis
        })
        svg.querySelectorAll('.tick text').forEach((n) => {
          ;(n as SVGElement).style.fill = EXPORT_COLORS.tick
        })
        svg.querySelectorAll('.grid .tick line').forEach((n) => {
          ;(n as SVGElement).style.stroke = EXPORT_COLORS.grid
        })
        svg.querySelectorAll('.line').forEach((n) => {
          ;(n as SVGElement).style.strokeWidth = '2.5'
        })

        map.set(key, svg.outerHTML)
      }

      document.body.removeChild(container)
    } catch {
      // Skip failed graphs
    }
  }

  return map
}
