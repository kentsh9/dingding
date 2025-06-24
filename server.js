const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const token = process.env.DING_TOKEN;
const aesKey = process.env.DING_AES_KEY;
const suiteKey = process.env.DING_SUITE_KEY || '';
const dingCrypto = new DingCrypto(token, aesKey, suiteKey);
const FORWARD_URL = process.env.FORWARD_URL;

app.post('/ding-webhook', async (req, res) => {
  try {
    const { encrypt } = req.body;
    console.log('[钉钉事件] 收到请求：', { encrypt });

    const decrypted = dingCrypto.decrypt(encrypt);
    console.log('[钉钉事件] 解密后明文：', decrypted);

    const result = await axios.post(FORWARD_URL, {
      text: decrypted
    });

    res.send('success');
  } catch (err) {
    console.error('[解密或转发失败]', err);
    res.status(500).send('error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 中转服务已启动：http://localhost:${PORT}/ding-webhook`);
});
