function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function getDefaultProfileImage(size = 96, label = 'User') {
  const initial = (label || 'U').trim().charAt(0).toUpperCase() || 'U'
  const fontSize = Math.round(size * 0.34)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1f2937" />
          <stop offset="1" stop-color="#4b5563" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${Math.round(size / 2)}" fill="url(#g)"/>
      <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.18}" fill="rgba(255,255,255,0.88)"/>
      <path d="M${size * 0.21} ${size * 0.84}c${size * 0.05}-${size * 0.16} ${size * 0.18}-${size * 0.24} ${size * 0.29}-${size * 0.24}h${size * 0.01}c${size * 0.11} 0 ${size * 0.24} ${size * 0.08} ${size * 0.29} ${size * 0.24}" fill="rgba(255,255,255,0.78)"/>
      <text x="50%" y="88%" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700">${initial}</text>
    </svg>
  `.replace(/\s+/g, ' ').trim()

  return svgToDataUri(svg)
}

export function getProfileImageSrc(src?: string | null, size = 96, label = 'User') {
  if (typeof src === 'string' && src.trim()) {
    return src
  }
  return getDefaultProfileImage(size, label)
}
