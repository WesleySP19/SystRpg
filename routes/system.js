import os from 'os';

export default function registerSystemRoutes(app) {
    // Endpoint de descoberta de rede para QR Code (IP Local LAN)
    app.get('/api/system/network', (req, res) => {
        const interfaces = os.networkInterfaces();
        const allIps = [];
        const virtualRegex = /(vethernet|virtualbox|vmware|tailscale|zerotier|hamachi|docker|wsl|loopback|teredo|npcap)/i;
        const priorityRegex = /(wi-fi|wifi|wireless|wlan|ethernet|eth|en0|en1|lan)/i;

        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    allIps.push({
                        name,
                        ip: iface.address,
                        isVirtual: virtualRegex.test(name),
                        isPriority: priorityRegex.test(name)
                    });
                }
            }
        }

        // Sort candidates: physical priority first, non-virtual second, then by common private IP ranges
        allIps.sort((a, b) => {
            if (a.isVirtual !== b.isVirtual) return a.isVirtual ? 1 : -1;
            if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
            // Prefer 192.168.x.x > 10.x.x.x > others
            const a192 = a.ip.startsWith('192.168.');
            const b192 = b.ip.startsWith('192.168.');
            if (a192 !== b192) return a192 ? -1 : 1;
            return 0;
        });

        const localIp = allIps.length > 0 ? allIps[0].ip : '127.0.0.1';
        const finalPort = req.socket.localPort || 4000;
        res.json({ ip: localIp, port: finalPort, allIps: allIps.map(i => ({ name: i.name, ip: i.ip })) });
    });

    app.get(['/api/system/health', '/api/system/status'], async (req, res) => {
        // Rota de heartbeat e integridade do servidor
        res.json({ status: 'ok', time: Date.now(), uptime: process.uptime() });
    });
}
