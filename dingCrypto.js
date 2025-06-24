const crypto = require('crypto');

class DingCrypto {
  constructor(token, aesKey, suiteKey = '') {
    this.token = token;
    this.suiteKey = suiteKey;
    this.encodingAESKey = aesKey;
    const AESKey_buffer = Buffer.from(aesKey + '=', 'base64');
    this.key = AESKey_buffer;
    this.iv = AESKey_buffer.slice(0, 16);
  }

  decrypt(text) {
    const encrypted = Buffer.from(text, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    decipher.setAutoPadding(false);
    let decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    const pad = decrypted[decrypted.length - 1];
    decrypted = decrypted.slice(20, decrypted.length - pad);
    return JSON.parse(decrypted.toString());
  }
}

module.exports = DingCrypto;
