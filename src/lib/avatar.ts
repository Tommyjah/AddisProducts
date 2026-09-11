const AVATAR_COLORS = [
  '#F59E15', '#EF4444', '#EC4899', '#A855F7', '#8B5CF6',
  '#3B82F6', '#06B6D4', '#10B981', '#22C55E', '#EAB308',
  '#F97316', '#DB27B6', '#7C3AED', '#4F46E5', '#0EA5E9',
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
  }
  return Math.abs(h)
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function generateAvatar(name: string, size: number = 80): string {
  const initials = getInitials(name)
  const color = AVATAR_COLORS[hash(name + initials) % AVATAR_COLORS.length]
  const fontSize = Math.round(size * 0.4)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size / 4}" fill="${color}"/>
  <text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle">${initials}</text>
</svg>
`

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function getAvatarUrl(src: string | undefined | null, name?: string, size?: number): string {
  if (src && src.trim()) return src
  return generateAvatar(name || 'User', size)
}
