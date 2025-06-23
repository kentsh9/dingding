const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DingCrypto = require('./dingCrypto');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// ✅ 正确的 Token 和 AES Key（43位 base64 字符串）
const TOKEN = 'YzULuBe8dZJtpbrZixi4xN59JnbBgCbUw2';
const AES_KEY = 'Y6Ahmp4xXPYqVlfVEgEpWeyJDlpx2RPzpR2qGvUuF6';
const CORP_ID = 'corpId'; // 可以是任意字符串（解密验证用）
const WEBHOOK = 'https://hook.us2.make.com/6axj86881p8nk68q4bveh1tisvkto4hu';

const crypto = new DingCrypto(TOKEN, AES_KEY, CORP_ID);

app.post('/ding-webhook', async (req, res) => {
  console.log('[钉钉事件] 收到请求：', req.body);

  const { signature, timestamp, nonce } = req.query;
  const { encrypt } = req.body;

  try {
    const decrypted = crypto.decrypt(encrypt);
    const json = JSON.parse(decrypted);

    // ✅ 验证事件（钉钉初次验证）
    if (json.echostr) {
      const encryptedEchoStr = crypto.encrypt(json.echostr);
      const msg_signature = crypto.getSignature(timestamp, nonce, encryptedEchoStr);

      return res.json({
        msg_signature,
        timeStamp: timestamp,
        nonce,
        encrypt: encryptedEchoStr
      });
    }

    // ✅ 普通业务事件：转发到 Make webhook
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
