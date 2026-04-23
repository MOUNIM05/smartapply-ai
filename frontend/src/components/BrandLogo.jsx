// Provides the Brand Logo reusable UI component.
import customLogo from '../assets/logo-smartapply-custom.png'

export default function BrandLogo({
  showWordmark = true,
  compact = false,
  soft = true,
  className = ''
}) {
  if (!showWordmark) {
    return (
      <img
        src={customLogo}
        alt="SmartApplyAI"
        className={`${className || 'h-10 w-10'} rounded-2xl object-contain p-1.5 ${soft ? 'brand-mark-soft' : 'bg-black/30 border border-white/10'}`}
      />
    )
  }

  return (
    <img
      src={customLogo}
      alt="SmartApplyAI"
      className={`${compact ? 'h-10 w-auto max-w-[11rem]' : 'h-14 w-auto max-w-[15rem]'} object-contain ${soft ? 'brand-logo-soft' : ''} ${className}`}
    />
  )
}
