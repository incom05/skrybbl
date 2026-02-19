interface SkryblLogoProps {
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

export function SkryblLogo({
  size = 16,
  color = 'currentColor',
  opacity = 1,
  className,
  style
}: SkryblLogoProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, flexShrink: 0, ...style }}
    >
      <g transform="matrix(2.51796,0,0,2.51796,-1563.66,-565.099)">
        <path
          d="M819.573,275.836L786.08,292.384L819.573,342.027L764.944,423L655.684,423L621,371.591L654.493,355.043L621,305.399L675.63,224.427L784.889,224.427L819.573,275.836ZM692.436,256.04L659.135,305.399L700.469,366.665L700.187,367.727L667.443,383.905L672.491,391.387L748.137,391.387L781.438,342.027L740.104,280.761L740.386,279.7L773.13,263.522L768.082,256.04L692.436,256.04Z"
          fill={color}
        />
      </g>
    </svg>
  )
}
