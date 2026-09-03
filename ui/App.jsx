import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from './core/hooks.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AuthScreenComponent } from './components/AuthScreen.jsx';
import { injectStyles } from './components/AuthScreenStyles.jsx';
import { TOME } from '../core/Registry.js';

/**
 * APP ROOT V23 — "The Unified Virtual DOM Shell"
 * Encapsulates the entire UI hierarchy into a single cohesive Preact virtual DOM tree.
 */
export function App() {
    const storeState = useStore();
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('DM_JWT_TOKEN');
        const activeTable = localStorage.getItem('DM_ACTIVE_TABLE');
        const sessionId = localStorage.getItem('DM_SESSION_ID');
        if (!storedToken && (activeTable || sessionId)) {
            const fallbackToken = 'local_session_' + Date.now();
            localStorage.setItem('DM_JWT_TOKEN', fallbackToken);
            return fallbackToken;
        }
        return storedToken;
    });

    useEffect(() => {
        const handleAuthRequired = () => {
            console.warn('[App] Reautenticação necessária.');
            localStorage.removeItem('DM_JWT_TOKEN');
            setToken(null);
        };
        TOME.events.on('AUTH_REQUIRED', handleAuthRequired);
        return () => TOME.events.off('AUTH_REQUIRED', handleAuthRequired);
    }, []);

    useEffect(() => {
        injectStyles();
    }, []);

    const handleLoginSuccess = () => {
        let currentToken = localStorage.getItem('DM_JWT_TOKEN');
        if (!currentToken) {
            currentToken = 'local_session_' + Date.now();
            localStorage.setItem('DM_JWT_TOKEN', currentToken);
        }
        setToken(currentToken);
    };

    if (!token) {
        return (
            <div id="auth-screen" className="fixed inset-0 bg-[#050508] bg-[radial-gradient(circle_at_center,_#23080d_0%,_#050508_100%)] flex flex-col items-center justify-center z-[999999] font-outfit">
                <AuthScreenComponent initialOnLogin={handleLoginSuccess} closeAuthScreen={handleLoginSuccess} />
            </div>
        );
    }

    return (
        <div id="app-viewport" className="flex w-screen h-screen overflow-hidden bg-[#0d0f12] text-slate-100 font-sans select-none">
            <aside id="sidebar-target" className="sidebar h-full flex-shrink-0 z-30">
                <Sidebar />
            </aside>
            <main id="view-target" className="main-stage flex-1 h-full overflow-y-auto relative z-10 [scrollbar-width:thin]">
                <Dashboard />
            </main>
        </div>
    );
}
