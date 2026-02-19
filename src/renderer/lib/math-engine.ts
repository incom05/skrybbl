import type { MathJsInstance } from 'mathjs'

let mathInstance: Promise<MathJsInstance> | null = null

function loadMathJs(): Promise<MathJsInstance> {
  if (!mathInstance) {
    mathInstance = import('mathjs').then((m) => m.create(m.all, {}))
  }
  return mathInstance
}

export interface ComputeResult {
  result: string | null
  error: string | null
}

export async function evaluate(expression: string): Promise<ComputeResult> {
  if (!expression.trim()) return { result: null, error: null }

  try {
    const math = await loadMathJs()
    const raw = math.evaluate(expression)
    const result = math.format(raw, { precision: 10 })
    return { result, error: null }
  } catch (err: any) {
    return { result: null, error: err.message || 'Error' }
  }
}
