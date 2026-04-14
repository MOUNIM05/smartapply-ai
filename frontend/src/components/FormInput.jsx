// Provides the Form Input reusable UI component.
import { forwardRef } from 'react'

const FormInput = forwardRef(({ label, icon: Icon, helper, className = '', ...inputProps }, ref) => {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      {label && <span className="text-slate-600 font-medium">{label}</span>}
      <div className="flex items-center gap-3 bg-white/90 border border-slate-200 rounded-xl px-3 py-3 shadow-inner hover:border-primary/20 hover:shadow-soft focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 focus-within:shadow-soft transition-all duration-200">
        {Icon && <Icon className="text-slate-400" size={18} />}
        <input
          ref={ref}
          className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          {...inputProps}
        />
      </div>
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
    </label>
  )
})

export default FormInput
