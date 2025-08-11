const express = require('express');
const fetch = require('node-fetch');
const { HttpsProxyAgent, HttpProxyAgent } = require('https-proxy-agent');

const app = express();

// 你的远程音频 URL
const targetAudioUrl = 'https://traffic.libsyn.com/secure/jbpod/Joe_Budden_Podcast_849.mp3?dest-id=2422538';

// 你的代理地址（HTTP 或 SOCKS）
const proxyUrl = 'http://127.0.0.1:1080';
// const proxyUrl = 'socks5://127.0.0.1:1080';

const agent = proxyUrl.startsWith('https')
    ? new HttpsProxyAgent(proxyUrl)
    : new HttpProxyAgent(proxyUrl);

// 音频代理路由
app.get('/audio', async (req, res) => {
    try {
        const response = await fetch(targetAudioUrl, { agent });

        if (!response.ok) {
            res.status(response.status).send('Failed to fetch audio');
            return;
        }

        res.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
        res.set('Content-Length', response.headers.get('content-length') || undefined);

        response.body.pipe(res); // 流式转发
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching audio');
    }
});

app.listen(3000, () => {
    console.log('Audio proxy server running at http://localhost:3000/audio');
});
