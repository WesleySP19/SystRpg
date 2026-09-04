import os from 'os';

export default function registerSystemRoutes(app) {
    // Endpoint de descoberta de rede para QR Code (IP Local LAN)
    app.get('/api/system/network', (req, res) => {
        const interfaces = os.networkInterfaces();
        let localIp = '127.0.0.1';
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIp = iface.address;
                    break;
                }
            }
        }
        const finalPort = req.socket.localPort || 4000;
        res.json({ ip: localIp, port: finalPort });
    });

    app.get(['/api/system/health', '/api/system/status'], async (req, res) => {
        // Rota de heartbeat e integridade do servidor
        res.json({ status: 'ok', time: Date.now(), uptime: process.uptime() });
    });
}
