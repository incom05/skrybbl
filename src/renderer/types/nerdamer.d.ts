declare module 'nerdamer' {
  interface NerdamerExpression {
    text(format?: string): string
    toString(): string
  }
  interface Nerdamer {
    (expression: string, subs?: Record<string, string>, option?: string[]): NerdamerExpression
    setVar(name: string, value: string): void
    getCore(): any
    diff(expr: string, variable?: string, n?: number): NerdamerExpression
    integrate(expr: string, variable?: string): NerdamerExpression
    solve(expr: string, variable?: string): NerdamerExpression
  }
  const nerdamer: Nerdamer
  export = nerdamer
}

declare module 'nerdamer/Solve' {
  export {}
}
declare module 'nerdamer/Calculus' {
  export {}
}
declare module 'nerdamer/Algebra' {
  export {}
}
