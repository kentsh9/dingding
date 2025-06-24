require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');

const app = express();
app.use(bodyParser.json());

const dingToken = process.env.DING_TOKEN;
const dingAesKey = process.env.DING_AES_KEY;
const forwardUrl = process.env.FORWARD_URL;

const ding = new DingCrypto(dingToken, dingAesKey);

app.post('/ding-webhook', async (req, res) => {
  try {
    console.log('[钉钉事件] 收到请求：', req.body);

    const { encrypt } = req.body;
    const decrypted = ding.decrypt(encrypt);

    console.log('[钉钉事件] 解密后明文：', decrypted);

    const json = JSON.parse(decrypted);

    // 回传 challenge 用于 URL 校验
    if (json.EventType === 'check_url') {
      return res.send({ challenge: json.challenge || 'success' });
    }

    // 正常事件转发到 Make webhook
    await axios.post(forwardUrl, {
      text: JSON.stringify(json),
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
