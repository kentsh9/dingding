const crypto = require('crypto');

class DingCrypto {
  constructor(token, aesKey) {
    this.token = token;
    this.aesKey = Buffer.from(aesKey + '=', 'base64');
    this.iv = this.aesKey.slice(0, 16);
  }

  decrypt(encrypt) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.iv);
    decipher.setAutoPadding(false);
    let decrypted = Buffer.concat([decipher.update(encrypt, 'base64'), decipher.final()]);

    // 去除 PKCS#7 Padding
    const pad = decrypted[decrypted.length - 1];
    decrypted = decrypted.slice(0, decrypted.length - pad);

    const content = decrypted.slice(16);
    const length = content.slice(0, 4).readUInt32BE(0);
    const message = content.slice(4, 4 + length).toString();

    return message;
  }
}

module.exports = DingCrypto;
