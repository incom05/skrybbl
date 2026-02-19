type SymbolicOp = 'simplify' | 'expand' | 'factor' | 'solve' | 'differentiate' | 'integrate'

let nerdamerPromise: Promise<typeof import('nerdamer')> | null = null

function loadNerdamer(): Promise<typeof import('nerdamer')> {
  if (!nerdamerPromise) {
    nerdamerPromise = (async () => {
      const nerdamer = (await import('nerdamer')).default
      await import('nerdamer/Solve')
      await import('nerdamer/Calculus')
      await import('nerdamer/Algebra')
      return nerdamer
    })()
  }
  return nerdamerPromise
}

export async function evaluateSymbolic(
  expression: string,
  operation: SymbolicOp,
  variable = 'x'
): Promise<{ result: string; error: string }> {
  if (!expression.trim()) return { result: '', error: '' }

  try {
    const nerdamer = await loadNerdamer()

    let res: string
    switch (operation) {
      case 'simplify':
        res = nerdamer(expression).text()
        break
      case 'expand':
        res = nerdamer(`expand(${expression})`).text()
        break
      case 'factor':
        res = nerdamer(`factor(${expression})`).text()
        break
      case 'solve':
        res = nerdamer.solve(expression, variable).text()
        break
      case 'differentiate':
        res = nerdamer.diff(expression, variable).text()
        break
      case 'integrate':
        res = nerdamer.integrate(expression, variable).text()
        break
      default:
        res = nerdamer(expression).text()
    }
    return { result: res, error: '' }
  } catch (err: any) {
    return { result: '', error: err?.message || 'Evaluation error' }
  }
}

export type { SymbolicOp }
