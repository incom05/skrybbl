let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null
let renderCounter = 0

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const mermaid = mod.default
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
      return mermaid
    })
  }
  return mermaidPromise
}

export async function renderDiagram(code: string): Promise<{ svg: string; error: string }> {
  if (!code.trim()) return { svg: '', error: '' }

  try {
    const mermaid = await loadMermaid()
    const id = `skrybl-diagram-${++renderCounter}`
    const { svg } = await mermaid.render(id, code)
    return { svg, error: '' }
  } catch (err: any) {
    return { svg: '', error: err?.message || 'Render error' }
  }
}
