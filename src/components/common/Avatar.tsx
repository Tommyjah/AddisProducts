import { getAvatarUrl } from '../../lib/avatar'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: number
  className?: string
  alt?: string
}

export function Avatar({ src, name = 'User', size = 40, className = '', alt }: AvatarProps) {
  const avatarSrc = getAvatarUrl(src, name, size)
  return (
    <img
      src={avatarSrc}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
    />
  )
}
