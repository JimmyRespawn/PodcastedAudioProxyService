const express = require('express');
const fetch = require('node-fetch');
const { HttpsProxyAgent, HttpProxyAgent } = require('https-proxy-agent');

const app = express();

// 你的代理地址（HTTP 或 SOCKS）
const proxyUrl = 'http://127.0.0.1:1080';
// const proxyUrl = 'socks5://127.0.0.1:1080';

const agent = proxyUrl.startsWith('https')
    ? new HttpsProxyAgent(proxyUrl)
    : new HttpProxyAgent(proxyUrl);

// 动态音频代理
app.get('/audio', async (req, res) => {
    const targetAudioUrl = req.query.url;

    if (!targetAudioUrl) {
        return res.status(400).send('Missing "url" query parameter');
    }

    try {
        console.log(`Proxying audio: ${targetAudioUrl}`);

        const response = await fetch(targetAudioUrl, { agent });

        if (!response.ok) {
            return res.status(response.status).send(`Failed to fetch audio: ${response.statusText}`);
        }

        // 透传重要响应头
        res.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
        res.set('Content-Length', response.headers.get('content-length') || undefined);

        // 流式转发
        response.body.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching audio');
    }
});

app.listen(3000, () => {
    console.log('Audio proxy server running at http://localhost:3000/audio?url=<target>');
});
