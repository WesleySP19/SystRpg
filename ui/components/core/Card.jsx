export function Card({ children, className = '', title, icon, actions, glass = true }) {
    const baseClass = glass ? 'bg-black/40 backdrop-blur-md' : 'bg-black/60';
    
    return (
        <div class={`${baseClass} p-6 rounded-2xl border border-accent/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${className}`}>
            {(title || icon || actions) && (
                <div class="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
                    <div class="font-cinzel text-accent text-xl font-bold flex items-center gap-2.5">
                        {icon && <i class={`fa-solid ${icon}`}></i>}
                        {title}
                    </div>
                    {actions && <div class="flex gap-2.5">{actions}</div>}
                </div>
            )}
            <div class="relative z-10">
                {children}
            </div>
        </div>
    );
}
