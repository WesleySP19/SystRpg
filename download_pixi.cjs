const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://unpkg.com/pixi.js@8.x/dist/pixi.min.mjs';
const dest = path.join(__dirname, 'public', 'vendor', 'pixi.min.mjs');

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
    if (response.statusCode === 302) {
        https.get(response.headers.location, function(res2) {
            res2.pipe(file);
            res2.on('finish', () => {
                file.close();
                console.log('PixiJS baixado com sucesso!');
            });
        });
    } else {
        response.pipe(file);
        response.on('finish', () => {
            file.close();
            console.log('PixiJS baixado com sucesso!');
        });
    }
}).on('error', (err) => {
    console.error('Erro no download:', err.message);
});
