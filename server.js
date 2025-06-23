const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 👇 替换为你自己的钉钉配置
const token = '你的新 token';
const aesKey = '你的新 aes_key';
const suiteKey = '';

const WEBHOOK_URL = 'https://hook.us2.make.com/6axj86881p8nk68q4bveh1tisvkto4hu';

const dingCrypto = new DingCrypto(token, aesKey, suiteKey);

app.post('/ding-webhook', async (req, res) => {
  try {
    const { encrypt } = req.body;
    console.log('[钉钉事件] 收到请求：', req.body);

    const plaintext = dingCrypto.decrypt(encrypt);
    console.log('[钉钉事件] 解密后明文：', plaintext);

    const decrypted = JSON.parse(plaintext);

    if (decrypted && decrypted.EventType === 'check_url') {
      return res.send({ msg: 'success' }); // 钉钉 check_url 验证
    }

    await axios.post(WEBHOOK_URL, {
      text: JSON.stringify(decrypted)
    });

    res.send('ok');
  } catch (err) {
    console.error('[解密或转发失败]', err);
    res.status(500).send('error');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 中转服务已启动：http://localhost:${PORT}/ding-webhook`);
});
