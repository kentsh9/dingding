// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const dingCrypto = new DingCrypto(process.env.DING_TOKEN, process.env.DING_AES_KEY, process.env.DING_APP_KEY);

app.post('/ding-webhook', async (req, res) => {
  try {
    console.log('[钉钉事件] 收到请求：', req.body);

    const encrypted = req.body.encrypt;
    const decrypted = dingCrypto.decrypt(encrypted);

    console.log('[钉钉事件] 解密后明文：', decrypted);

    const event = JSON.parse(decrypted);

    // 必须返回 check_url 明文内容，否则钉钉校验失败
    if (event.EventType === 'check_url') {
      return res.json(event);
    }

    // 正常事件转发到 Make 的 webhook
    await axios.post(process.env.MAKE_WEBHOOK_URL, {
      text: decrypted
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('[解密或转发失败]', error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 中转服务已启动：http://localhost:${PORT}/ding-webhook`);
});
