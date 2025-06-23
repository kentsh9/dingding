const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 🔁 修改为你自己的 Make Webhook URL
const WEBHOOK_URL = 'https://hook.us2.make.com/6axj86881p8nk68q4bveh1tisvkto4hu';

// 🔐 这里填写你在钉钉应用配置页面中看到的 token 和 aes_key
const token = '你在钉钉看到的新token';
const aesKey = '你在钉钉看到的新aes_key';
const suiteKey = ''; // 保持为空即可

const dingCrypto = new DingCrypto(token, aesKey, suiteKey);

app.post('/ding-webhook', async (req, res) => {
  try {
    const { encrypt } = req.body;
    console.log('[钉钉事件] 收到请求：', req.body);

    const plaintext = dingCrypto.decrypt(encrypt);
    console.log('[钉钉事件] 解密后明文：', plaintext);

    const decrypted = JSON.parse(plaintext);

    // ✅ 处理钉钉 check_url 验证
    if (decrypted && decrypted.EventType === 'check_url') {
      return res.send({ msg: 'success' });
    }

    // 🔁 正常事件，转发到 Make Webhook
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
