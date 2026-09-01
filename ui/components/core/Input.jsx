export function Input({
    type = 'text',
    value,
    onInput,
    placeholder,
    className = '',
    icon = null,
    min,
    max,
    disabled = false,
    ...props
}) {
    return (
        <div class={`relative flex items-center ${className}`}>
            {icon && <i class={`fa-solid ${icon} absolute left-3 text-slate-400 text-xs`}></i>}
            <input
                type={type}
                class={`w-full bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50 focus:shadow-[0_0_10px_rgba(197,160,89,0.2)] transition-all placeholder:text-slate-500 ${icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2'} disabled:opacity-50`}
                value={value}
                onInput={onInput}
                placeholder={placeholder}
                min={min}
                max={max}
                disabled={disabled}
                {...props}
            />
        </div>
    );
}
