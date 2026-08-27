import { render } from 'preact';

export function ModalComponent({ title, content, type, onConfirm, onCancel, onClose }) {
    const icon = type === 'danger' ? 'fa-triangle-exclamation' : 
                 type === 'confirm' ? 'fa-circle-question' : 'fa-circle-info';
    
    const borderClass = type === 'danger' ? 'border-red-500' : 'border-tomeGold';
    const iconClass = type === 'danger' ? 'text-red-500' : 'text-tomeGold';
    const btnClass = type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-tomeGold hover:bg-tomeGold-bright';

    // Handle HTML formatting from legacy content (line breaks)
    const formattedContent = typeof content === 'string' 
        ? content.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)
        : content;

    return (
        <div class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-5 animate-in fade-in duration-300">
            <div class={`modal-card relative w-full max-w-[500px] border-t-4 ${borderClass} bg-obsidian-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden animate-in zoom-in-95 duration-300`}>
                <div class="modal-header px-6 py-5 border-b border-white/5 flex items-center gap-3">
                    <i class={`fa-solid ${icon} ${iconClass} text-xl`}></i>
                    <h2 class="m-0 font-cinzel text-lg font-bold tracking-wide text-slate-100">{title}</h2>
                </div>
                
                <div class="modal-body px-7 py-6 text-sm text-slate-300 leading-relaxed font-sans">
                    {formattedContent}
                </div>
                
                <div class="modal-footer px-7 py-4 bg-black/40 flex justify-end gap-3">
                    {(type === 'confirm' || type === 'danger') && (
                        <button class="px-4 py-2 rounded-lg font-sans text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-slate-200 transition-colors" onClick={onCancel}>
                            CANCELAR
                        </button>
                    )}
                    <button class={`px-6 py-2 rounded-lg font-sans text-sm font-semibold text-white ${btnClass} min-w-[100px] transition-colors shadow-lg`} onClick={onConfirm}>
                        {(type === 'confirm' || type === 'danger') ? 'CONFIRMAR' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * MODAL COMPONENT v2.0
 * High-fidelity, diegetic modal system with Glassmorphism.
 * Replaces native alert() and confirm().
 */
export class Modal {
    static show(opts) {
        const target = document.createElement('div');
        target.id = `modal-${Date.now()}`;
        document.body.appendChild(target);
        
        const close = () => {
            render(null, target);
            target.remove();
        };

        const handleConfirm = () => {
            if (opts.onConfirm) opts.onConfirm();
            close();
        };

        const handleCancel = () => {
            if (opts.onCancel) opts.onCancel();
            close();
        };

        render(
            <ModalComponent 
                title={opts.title || 'Aviso'} 
                content={opts.content || ''} 
                type={opts.type || 'info'} 
                onConfirm={handleConfirm} 
                onCancel={handleCancel} 
                onClose={close} 
            />, 
            target
        );
    }

    /**
     * Promise-based confirm
     */
    static confirm(title, content, type = 'confirm') {
        return new Promise((resolve) => {
            Modal.show({
                title,
                content,
                type,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    /**
     * Promise-based alert
     */
    static alert(title, content, type = 'info') {
        return new Promise((resolve) => {
            Modal.show({
                title,
                content,
                type,
                onConfirm: () => resolve(true)
            });
        });
    }
}
