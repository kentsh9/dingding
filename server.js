const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const TOKEN = 'YzULuBe8dZJtpbrZixi4xN59JnbBgCbUw2';
const AES_KEY = 'Y6Ahmp4xXPYqVlfVEgEpWeyJDlpx2RPzpR2qGvUuF6';
const WEBHOOK = 'https://hook.us2.make.com/6axj86881p8nk68q4bveh1tisvkto4hu';

const Ding = new DingCrypto(TOKEN, AES_KEY, 'corpId');

app.post('/ding-webhook', async (req, res) => {
  console.log('[钉钉事件] 收到请求：', req.body);
  const { signature, timestamp, nonce } = req.query;
  const { encrypt } = req.body;

  try {
    const decrypted = Ding.decrypt(encrypt);
    const json = JSON.parse(decrypted);

    if (json.echostr) {
      const encrypted = Ding.encrypt(json.echostr);
      const msg_signature = Ding.getSignature(timestamp, nonce, encrypted);

      return res.json({
        msg_signature,
        timeStamp: timestamp,
        nonce,
        encrypt: encrypted
      });
    }

    await axios.post(WEBHOOK, json);
    res.send('ok');
  } catch (err) {
    console.error('[解密失败]', err);
    res.status(500).send('error');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 中转服务已启动：http://localhost:${PORT}/ding-webhook`);
});
