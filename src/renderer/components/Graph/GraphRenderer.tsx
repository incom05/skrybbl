import { useRef, useEffect, useState } from 'react'
import type { GraphFunc } from './GraphPlotView'
import { useUIStore } from '../../stores/ui-store'

interface GraphRendererProps {
  functions: GraphFunc[]
  xDomain: [number, number]
  yDomain: [number, number]
  width: number
  height: number
  showGrid: boolean
}

let fpLoader: Promise<typeof import('function-plot')> | null = null

function loadFunctionPlot(): Promise<typeof import('function-plot')> {
  if (!fpLoader) {
    fpLoader = import('function-plot')
  }
  return fpLoader
}

/** Render a graph into a target element and apply theme styling */
export function renderGraph(
  el: HTMLElement,
  functions: GraphFunc[],
  xDomain: [number, number],
  yDomain: [number, number],
  width: number,
  height: number,
  showGrid: boolean,
  fp: any
): void {
  const { textColor, axisColor, gridColor } = getThemeColors()

  fp({
    target: el,
    width,
    height,
    xAxis: { domain: xDomain },
    yAxis: { domain: yDomain },
    grid: showGrid,
    data: functions
      .filter((f) => f.expression.trim())
      .map((f) => ({
        fn: f.expression,
        graphType: 'polyline' as const,
        color: textColor
      }))
  })

  applyThemeToSvg(el, textColor, axisColor, gridColor)
}

/** Post-process function-plot SVG to match theme */
function applyThemeToSvg(
  el: HTMLElement,
  textColor: string,
  axisColor: string,
  gridColor: string
): void {
  const svg = el.querySelector('svg')
  if (!svg) return

  svg.querySelectorAll('.domain').forEach((n) => {
    ;(n as SVGElement).style.stroke = axisColor
  })
  svg.querySelectorAll('.tick line').forEach((n) => {
    ;(n as SVGElement).style.stroke = axisColor
  })
  svg.querySelectorAll('.tick text').forEach((n) => {
    ;(n as SVGElement).style.fill = textColor
  })
  svg.querySelectorAll('.grid .tick line').forEach((n) => {
    ;(n as SVGElement).style.stroke = gridColor
  })
  svg.querySelectorAll('.line').forEach((n) => {
    const line = n as SVGElement
    line.style.strokeWidth = '2.5'
  })
}

export function GraphRenderer({
  functions,
  xDomain,
  yDomain,
  width,
  height,
  showGrid
}: GraphRendererProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false

    loadFunctionPlot().then((mod) => {
      if (cancelled || !el) return

      const functionPlot = mod.default || mod
      el.innerHTML = ''

      try {
        renderGraph(el, functions, xDomain, yDomain, width, height, showGrid, functionPlot)
      } catch {
        el.innerHTML = '<span style="color: var(--text-muted); font-size: 12px;">Invalid expression</span>'
      }
    })

    return () => {
      cancelled = true
    }
  }, [functions, xDomain, yDomain, width, height, showGrid, theme])

  return <div ref={containerRef} />
}

function getThemeColors(): { textColor: string; axisColor: string; gridColor: string } {
  const root = getComputedStyle(document.documentElement)
  const textColor = root.getPropertyValue('--text-primary').trim() || '#d4d4d4'
  const axisColor = root.getPropertyValue('--text-muted').trim() || '#555555'
  const gridColor = root.getPropertyValue('--border-light').trim() ||
    root.getPropertyValue('--border').trim() || 'rgba(128,128,128,0.2)'
  return { textColor, axisColor, gridColor }
}

export { loadFunctionPlot }
