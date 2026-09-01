export function Button({ 
    children, 
    variant = 'default', 
    size = 'md', 
    className = '', 
    icon = null,
    onClick,
    title,
    disabled = false,
    ...props 
}) {
    const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-md';
    
    const variants = {
        default: 'bg-black/40 border border-white/10 text-slate-300 hover:border-accent/40 hover:bg-black/60 hover:text-white',
        primary: 'bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 hover:shadow-[0_0_15px_rgba(197,160,89,0.3)] font-cinzel tracking-wider',
        ghost: 'bg-transparent border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200',
        danger: 'bg-danger/10 border border-danger/30 text-red-300 hover:bg-danger/20 hover:border-danger/50 hover:text-red-200',
        success: 'bg-success/15 border border-success/30 text-green-300 hover:bg-success/25 hover:border-success/50 hover:text-green-200',
        magic: 'bg-purple-900/40 border border-purple-500/50 text-purple-200 hover:bg-purple-800/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:border-purple-400/80 font-cinzel',
    };

    const sizes = {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
        icon: 'p-2 text-sm aspect-square flex items-center justify-center rounded-full',
    };

    const vClass = variants[variant] || variants.default;
    const sClass = sizes[size] || sizes.md;

    return (
        <button 
            class={`${baseClasses} ${vClass} ${sClass} ${className}`}
            onClick={onClick}
            title={title}
            disabled={disabled}
            {...props}
        >
            {icon && <i class={`fa-solid ${icon} ${children ? 'mr-2' : ''}`}></i>}
            {children}
        </button>
    );
}
