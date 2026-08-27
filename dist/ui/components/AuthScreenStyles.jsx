export function injectStyles() {
if (document.getElementById('auth-screen-styles')) return;
const style = document.createElement('style');
style.id = 'auth-screen-styles';
style.textContent = `
@keyframes authFadeIn {
from { opacity: 0; transform: scale(0.96) translateY(12px); }
to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes authFadeOut {
from { opacity: 1; transform: scale(1); }
to { opacity: 0; transform: scale(0.96) translateY(12px); }
}
@keyframes floatLogo {
0% { transform: translateY(0px) rotate(0deg); }
50% { transform: translateY(-6px) rotate(1.5deg); }
100% { transform: translateY(0px) rotate(0deg); }
}
@keyframes eyeGlow {
0% { box-shadow: 0 0 15px rgba(153, 27, 27, 0.4), 0 0 3px rgba(197, 160, 89, 0.2); border-color: #c5a059; }
50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.7), 0 0 10px rgba(251, 191, 36, 0.5); border-color: #fbbf24; }
100% { box-shadow: 0 0 15px rgba(153, 27, 27, 0.4), 0 0 3px rgba(197, 160, 89, 0.2); border-color: #c5a059; }
}
@keyframes shake {
0%, 100% { transform: translateX(0); }
20%, 60% { transform: translateX(-6px); }
40%, 80% { transform: translateX(6px); }
}
@keyframes spinFast {
0% { transform: rotate(0deg) scale(1.1); }
100% { transform: rotate(360deg) scale(1.1); }
}
.auth-error-banner {
display: flex;
align-items: center;
gap: 10px;
background: rgba(239, 68, 68, 0.12);
border: 1px solid rgba(239, 68, 68, 0.4);
border-left: 3px solid #ef4444;
border-radius: 10px;
padding: 12px 15px;
margin-bottom: 16px;
font-size: 0.82rem;
color: #fca5a5;
text-align: left;
line-height: 1.4;
animation: authFadeIn 0.3s ease-out, shake 0.4s ease-out;
box-sizing: border-box;
}
.auth-error-banner.auth-error-success {
background: rgba(34, 197, 94, 0.1);
border-color: rgba(34, 197, 94, 0.35);
border-left-color: #22c55e;
color: #86efac;
animation: authFadeIn 0.3s ease-out;
}
.auth-error-banner .auth-error-icon {
font-size: 1.1rem;
flex-shrink: 0;
}
.auth-card {
width: 100%;
max-width: 420px;
padding: 40px 30px;
border-radius: 24px;
background: rgba(8, 7, 10, 0.85);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(197, 160, 89, 0.25);
position: relative;
box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9),
0 0 80px rgba(153, 27, 27, 0.2);
text-align: center;
color: #f1f5f9;
animation: authFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
overflow: visible;
box-sizing: border-box;
}
.auth-card::before {
content: '';
position: absolute;
top: 0; left: 0; right: 0; height: 3px;
border-radius: 24px 24px 0 0;
background: linear-gradient(90deg, #991b1b, #c5a059, #991b1b);
opacity: 0.8;
}
.auth-logo-container {
position: relative;
display: inline-block;
margin-bottom: 18px;
}
.auth-logo {
width: 100px;
height: 100px;
border-radius: 50%;
object-fit: cover;
border: 2px solid #c5a059;
background-color: #0b090a;
animation: floatLogo 4.5s ease-in-out infinite, eyeGlow 4s ease-in-out infinite;
box-shadow: 0 5px 15px rgba(0,0,0,0.6);
transition: transform 0.2s;
}
.auth-logo-container:hover .auth-logo {
animation: spinFast 0.3s linear infinite, eyeGlow 0.5s ease-in-out infinite;
}
.auth-logo-balloon {
position: absolute;
bottom: 110%;
left: 50%;
transform: translateX(-50%) scale(0.85);
background: #ffffff;
color: #0f172a;
padding: 8px 14px;
border-radius: 10px;
font-family: 'Outfit', sans-serif;
font-size: 0.82rem;
font-weight: 800;
white-space: nowrap;
box-shadow: 0 10px 25px rgba(0,0,0,0.8);
border: 2px solid #c5a059;
opacity: 0;
pointer-events: none;
cursor: pointer;
transition: opacity 0.25s ease, transform 0.25s ease;
z-index: 1000;
text-align: center;
line-height: 1.3;
}
.auth-logo-balloon::before {
content: '';
position: absolute;
bottom: -9px;
left: 50%;
transform: translateX(-50%);
border-width: 9px 8px 0 8px;
border-style: solid;
border-color: #c5a059 transparent transparent transparent;
}
.auth-logo-balloon::after {
content: '';
position: absolute;
bottom: -6px;
left: 50%;
transform: translateX(-50%);
border-width: 7px 6px 0 6px;
border-style: solid;
border-color: #ffffff transparent transparent transparent;
}
.auth-logo-container:hover .auth-logo-balloon {
opacity: 1;
transform: translateX(-50%) scale(1);
pointer-events: auto;
}
.auth-title {
font-family: 'Cinzel', serif;
font-size: 1.8rem;
font-weight: 900;
margin: 0 0 3px 0;
background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 70%, #c5a059 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
letter-spacing: 2px;
text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.auth-subtitle {
font-family: 'Outfit', sans-serif;
color: #94a3b8;
font-size: 0.8rem;
margin-bottom: 25px;
letter-spacing: 1.5px;
text-transform: uppercase;
font-weight: 600;
}
.auth-subtitle span {
color: #ef4444;
text-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
font-weight: 800;
}
.auth-description {
font-family: 'Outfit', sans-serif;
font-size: 0.85rem;
color: #cbd5e1;
margin-bottom: 18px;
text-align: left;
line-height: 1.5;
}
.auth-input {
width: 100%;
padding: 15px;
border-radius: 10px;
border: 2px solid rgba(197, 160, 89, 0.25);
background: rgba(0, 0, 0, 0.65);
color: #fff;
font-size: 1.1rem;
outline: none;
box-sizing: border-box;
font-family: 'JetBrains Mono', monospace;
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
box-shadow: inset 0 2px 6px rgba(0,0,0,0.8);
text-align: center;
margin-bottom: 20px;
}
.auth-input:focus {
border-color: #fbbf24;
background: rgba(153, 27, 27, 0.15);
box-shadow: 0 0 20px rgba(239, 68, 68, 0.3),
inset 0 2px 4px rgba(0,0,0,0.6);
}
.auth-btn {
width: 100%;
padding: 15px;
border-radius: 10px;
border: 1px solid #7f1d1d;
background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #c5a059 100%);
color: #fff;
font-weight: 800;
font-size: 0.95rem;
cursor: pointer;
text-transform: uppercase;
letter-spacing: 2px;
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
box-shadow: 0 4px 12px rgba(153, 27, 27, 0.3);
position: relative;
overflow: hidden;
}
.auth-btn::after {
content: '';
position: absolute;
top: 0; left: -100%; width: 100%; height: 100%;
background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
transition: all 0.6s;
}
.auth-btn:hover {
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35), 0 0 10px rgba(197, 160, 89, 0.25);
background: linear-gradient(135deg, #991b1b 0%, #b91c1c 40%, #fbbf24 100%);
}
.auth-btn:hover::after {
left: 100%;
}
.auth-btn:active {
transform: translateY(0);
}
.auth-sim-box {
background: rgba(153, 27, 27, 0.1);
border: 1px dashed rgba(197, 160, 89, 0.45);
padding: 12px;
margin-bottom: 20px;
border-radius: 10px;
font-size: 0.8rem;
color: #fcd34d;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
animation: authFadeIn 0.5s ease-out;
box-sizing: border-box;
}
.auth-sim-code {
font-family: 'JetBrains Mono', monospace;
font-size: 1.15rem;
font-weight: 800;
letter-spacing: 3px;
color: #fbbf24;
text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
background: rgba(0, 0, 0, 0.25);
padding: 2px 8px;
border-radius: 4px;
margin-left: 4px;
}
.auth-back-link {
display: inline-block;
margin-top: 15px;
background: transparent;
border: none;
color: #94a3b8;
font-size: 0.8rem;
cursor: pointer;
font-family: 'Outfit', sans-serif;
transition: color 0.2s, transform 0.2s;
text-decoration: underline;
}
.auth-back-link:hover {
color: #fbbf24;
transform: translateX(-2px);
}
.tables-scroll-container {
max-height: 260px;
overflow-y: auto;
margin-bottom: 20px;
padding-right: 5px;
box-sizing: border-box;
}
.tables-scroll-container::-webkit-scrollbar {
width: 6px;
}
.tables-scroll-container::-webkit-scrollbar-track {
background: rgba(0,0,0,0.2);
border-radius: 3px;
}
.tables-scroll-container::-webkit-scrollbar-thumb {
background: rgba(197, 160, 89, 0.3);
border-radius: 3px;
}
.tables-scroll-container::-webkit-scrollbar-thumb:hover {
background: rgba(197, 160, 89, 0.6);
}
.table-card {
background: rgba(15, 12, 16, 0.65);
border: 1px solid rgba(197, 160, 89, 0.15);
border-radius: 14px;
padding: 16px;
margin-bottom: 12px;
text-align: left;
box-sizing: border-box;
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
position: relative;
overflow: hidden;
}
.table-card::after {
content: '';
position: absolute;
left: 0; top: 0; bottom: 0; width: 3px;
background: linear-gradient(to bottom, #c5a059, #991b1b);
opacity: 0.6;
transition: all 0.3s ease;
}
.table-card:hover {
transform: translateY(-2px);
border-color: rgba(251, 191, 36, 0.4);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5),
0 0 15px rgba(153, 27, 27, 0.1);
background: rgba(25, 20, 26, 0.85);
}
.table-card:hover::after {
width: 4px;
opacity: 1;
}
.table-card-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 10px;
}
.table-card-id {
font-family: 'Cinzel', serif;
font-weight: 700;
font-size: 0.95rem;
color: #c5a059;
letter-spacing: 1px;
text-shadow: 0 0 8px rgba(197, 160, 89, 0.2);
}
.table-card-date {
font-size: 0.75rem;
color: #64748b;
}
.table-card-body {
display: flex;
gap: 10px;
margin-bottom: 14px;
}
.table-stat-badge {
font-size: 0.75rem;
padding: 4px 10px;
border-radius: 6px;
font-weight: 600;
display: flex;
align-items: center;
gap: 5px;
}
.session-badge {
background: rgba(153, 27, 27, 0.2);
color: #f87171;
border: 1px solid rgba(153, 27, 27, 0.3);
}
.hero-badge {
background: rgba(197, 160, 89, 0.15);
color: #fbbf24;
border: 1px solid rgba(197, 160, 89, 0.25);
}
.table-enter-btn {
width: 100%;
padding: 10px;
border-radius: 8px;
border: 1px solid rgba(197, 160, 89, 0.25);
background: rgba(0, 0, 0, 0.4);
color: #f1f5f9;
font-weight: 700;
font-size: 0.8rem;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
transition: all 0.2s ease;
}
.table-enter-btn:hover {
background: linear-gradient(90deg, #991b1b 0%, #c5a059 100%);
color: #000;
font-weight: 800;
border-color: transparent;
box-shadow: 0 4px 10px rgba(197, 160, 89, 0.2);
}
.auth-btn-secondary {
padding: 12px;
border-radius: 10px;
border: 1px solid rgba(255, 255, 255, 0.08);
background: rgba(255, 255, 255, 0.03);
color: #c5a059;
font-weight: 700;
font-size: 0.85rem;
cursor: pointer;
transition: all 0.3s ease;
display: flex;
align-items: center;
justify-content: center;
gap: 6px;
box-sizing: border-box;
}
.auth-btn-secondary:hover {
background: rgba(197, 160, 89, 0.1);
border-color: rgba(197, 160, 89, 0.35);
color: #fbbf24;
box-shadow: 0 0 10px rgba(197, 160, 89, 0.1);
}
`;
document.head.appendChild(style);
}