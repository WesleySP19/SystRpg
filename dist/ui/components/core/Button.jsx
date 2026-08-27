import { html } from 'htm/preact';
export function Button({
children,
onClick,
variant = 'ghost',
size = 'md',
icon = null,
className = '',
disabled = false,
title = '',
style = {}
}) {
let btnClass = 'btn';
if (variant === 'primary') btnClass += ' btn-primary';
else if (variant === 'premium') btnClass += ' btn-premium';
else if (variant === 'magic') btnClass += ' btn-magic';
else if (variant === 'danger') btnClass += ' btn-ghost danger'; // ghost com cor vermelha (como no projeto)
else btnClass += ' btn-ghost'; // default
if (size === 'sm') btnClass += ' btn-sm';
return html`
<button
class="${btnClass} ${className}"
onClick=${onClick}
disabled=${disabled}
title=${title}
style=${style}
>
${icon ? html`<i class="fa-solid ${icon} ${children ? 'mr-2' : ''}"></i>` : ''}
${children}
</button>
`;
}