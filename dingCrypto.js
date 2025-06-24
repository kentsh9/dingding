const crypto = require('crypto');

class DingCrypto {
  constructor(token, aesKey, suiteKey) {
    this.token = token;
    this.aesKey = Buffer.from(aesKey + '=', 'base64');
    this.iv = this.aesKey.slice(0, 16);
    this.suiteKey = suiteKey;
  }

  decrypt(encrypt) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.iv);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(encrypt, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

module.exports = DingCrypto;
