import fullLogo from '../assets/logo-smartapply-full.png'
import markLogo from '../assets/logo-smartapply-mark.png'

export default function BrandLogo({
  showWordmark = true,
  compact = false,
  className = ''
}) {
  if (!showWordmark) {
    return (
      <img
        src={markLogo}
        alt="SmartApplyAI"
        className={`${className || 'h-10 w-10'} rounded-2xl object-contain bg-white`}
      />
    )
  }

  return (
    <img
      src={fullLogo}
      alt="SmartApplyAI"
      className={`${compact ? 'h-10 w-auto max-w-[11rem]' : 'h-14 w-auto max-w-[15rem]'} object-contain ${className}`}
    />
  )
}
