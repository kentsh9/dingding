require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');

const app = express();
app.use(bodyParser.json());

const token = process.env.DING_TOKEN;
const aesKey = process.env.DING_AES_KEY;
const suiteKey = process.env.SUITE_KEY || '';
const forwardUrl = process.env.FORWARD_URL;

const dingCrypto = new DingCrypto(token, aesKey, suiteKey);

app.post('/ding-webhook', async (req, res) => {
  try {
    console.log('[钉钉事件] 收到请求：', req.body);

    const encrypt = req.body.encrypt;
    const decrypted = dingCrypto.decrypt(encrypt);

    console.log('[钉钉事件] 解密后明文：', decrypted);

    // 钉钉验证地址时返回 success
    if (decrypted.EventType === 'check_url') {
      return res.send('success');
    }

    // 转发到 Make webhook
    await axios.post(forwardUrl, {
      text: JSON.stringify(decrypted),
    });

    res.send('success');
  } catch (error) {
    console.error('[解密或转发失败]', error);
    res.status(500).send('error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 中转服务已启动：http://localhost:${PORT}/ding-webhook`);
});
