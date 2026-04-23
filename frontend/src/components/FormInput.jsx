// Provides the Form Input reusable UI component.
import { forwardRef } from 'react'

const FormInput = forwardRef(({ label, icon: Icon, helper, className = '', ...inputProps }, ref) => {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      {label && <span className="text-slate-400 font-medium">{label}</span>}
      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 hover:border-violet-400/40 focus-within:border-violet-400/70 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all duration-200">
        {Icon && <Icon className="text-slate-500" size={18} />}
        <input
          ref={ref}
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
          {...inputProps}
        />
      </div>
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
    </label>
  )
})

export default FormInput
