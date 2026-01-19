interface AmbientBackgroundProps {
  /** Color palette for the day - affects gradient colors */
  palette?: 'coral' | 'blue' | 'violet' | 'teal' | 'rose' | 'amber' | 'emerald'
  /** Whether the exercise is actively running - controls animation speed */
  isActive?: boolean
}

const PALETTES = {
  coral: {
    primary: 'rgba(249, 115, 22, 0.35)',
    secondary: 'rgba(251, 146, 60, 0.25)',
    tertiary: 'rgba(236, 72, 153, 0.2)',
  },
  blue: {
    primary: 'rgba(59, 130, 246, 0.35)',
    secondary: 'rgba(96, 165, 250, 0.25)',
    tertiary: 'rgba(139, 92, 246, 0.2)',
  },
  violet: {
    primary: 'rgba(139, 92, 246, 0.35)',
    secondary: 'rgba(192, 132, 252, 0.25)',
    tertiary: 'rgba(236, 72, 153, 0.2)',
  },
  teal: {
    primary: 'rgba(20, 184, 166, 0.35)',
    secondary: 'rgba(45, 212, 191, 0.25)',
    tertiary: 'rgba(59, 130, 246, 0.2)',
  },
  rose: {
    primary: 'rgba(244, 63, 94, 0.35)',
    secondary: 'rgba(251, 113, 133, 0.25)',
    tertiary: 'rgba(249, 115, 22, 0.2)',
  },
  amber: {
    primary: 'rgba(245, 158, 11, 0.35)',
    secondary: 'rgba(251, 191, 36, 0.25)',
    tertiary: 'rgba(249, 115, 22, 0.2)',
  },
  emerald: {
    primary: 'rgba(16, 185, 129, 0.35)',
    secondary: 'rgba(52, 211, 153, 0.25)',
    tertiary: 'rgba(20, 184, 166, 0.2)',
  },
}

export function AmbientBackground({ palette = 'violet', isActive = false }: AmbientBackgroundProps) {
  const colors = PALETTES[palette]

  // Much more dramatic difference between idle and active
  // Idle: nearly frozen, subtle
  // Active: alive, breathing, dynamic
  const durations = isActive
    ? { blob1: '8s', blob2: '10s', blob3: '6s' }
    : { blob1: '300s', blob2: '360s', blob3: '240s' }

  // Scale: blobs grow slightly when active
  const scale = isActive ? 1.15 : 1

  // Blur: slightly less blur when active for more definition
  const blur = isActive ? '100px' : '140px'

  return (
    <div className="ambient-container">
      {/* Primary blob - largest */}
      <div
        className="ambient-blob ambient-blob-1"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, transparent 70%)`,
          animationDuration: durations.blob1,
          opacity: isActive ? 1 : 0.6,
          transform: `scale(${scale})`,
          filter: `blur(${blur})`,
          transition: 'opacity 0.8s ease, transform 1.5s ease, filter 1s ease',
        }}
      />

      {/* Secondary blob - medium */}
      <div
        className="ambient-blob ambient-blob-2"
        style={{
          background: `linear-gradient(225deg, ${colors.secondary}, transparent 70%)`,
          animationDuration: durations.blob2,
          opacity: isActive ? 0.9 : 0.5,
          transform: `scale(${isActive ? 1.1 : 1})`,
          filter: `blur(${blur})`,
          transition: 'opacity 0.8s ease, transform 1.5s ease, filter 1s ease',
        }}
      />

      {/* Tertiary blob - smallest, accent */}
      <div
        className="ambient-blob ambient-blob-3"
        style={{
          background: `linear-gradient(45deg, ${colors.tertiary}, transparent 60%)`,
          animationDuration: durations.blob3,
          opacity: isActive ? 0.85 : 0.35,
          transform: `scale(${isActive ? 1.2 : 0.9})`,
          filter: `blur(${isActive ? '80px' : '140px'})`,
          transition: 'opacity 0.8s ease, transform 1.5s ease, filter 1s ease',
        }}
      />

      {/* Subtle noise overlay for texture */}
      <div className="ambient-noise" />
    </div>
  )
}
