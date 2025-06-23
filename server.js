const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dingCrypto = require('./dingCrypto');

const app = express();
const PORT = process.env.PORT || 3000;
const FORWARD_URL = 'https://hook.us2.make.com/6axj86881p8nk68q4bveh1tisvkto4hu';

app.use(bodyParser.json());

app.post('/ding-webhook', async (req, res) => {
  try {
    console.log('[钉钉事件] 收到请求：', req.body);
    const encrypted = req.body.encrypt;
    const decryptedText = dingCrypto.decrypt(encrypted);
    console.log('[钉钉事件] 解密后明文：', decryptedText);

    // 转发到 Make Webhook
    await axios.post(FORWARD_URL, {
      text: decryptedText,
    });

    res.send({ msg_signature: req.query.msg_signature, encrypt: encrypted, timeStamp: req.query.timestamp, nonce: req.query.nonce });
  } catch (error) {
    console.error('[解密或转发失败]', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 中转服务已启动：http://localhost:${PORT}/ding-webhook`);
});
