const crypto = require('crypto');

class DingCrypto {
  constructor(token, encodingAESKey, corpId) {
    this.token = token;
    this.key = Buffer.from(encodingAESKey + '=', 'base64');
    this.iv = this.key.slice(0, 16);
    this.corpId = corpId;
  }

  getSignature(timestamp, nonce, encrypt) {
    const arr = [this.token, timestamp, nonce, encrypt].sort();
    const str = arr.join('');
    return crypto.createHash('sha1').update(str).digest('hex');
  }

  decrypt(text) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    decipher.setAutoPadding(false);
    let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);

    const pad = deciphered[deciphered.length - 1];
    deciphered = deciphered.slice(0, deciphered.length - pad);

    const content = deciphered.slice(16);
    const length = content.slice(0, 4).readUInt32BE(0);
    const result = content.slice(4, 4 + length);
    return result.toString();
  }

  encrypt(text) {
    const random = crypto.randomBytes(16);
    const msg = Buffer.from(text);
    const msgLength = Buffer.alloc(4);
    msgLength.writeUInt32BE(msg.length, 0);
    const corpId = Buffer.from(this.corpId);
    const rawMsg = Buffer.concat([random, msgLength, msg, corpId]);

    const pad = 32 - (rawMsg.length % 32);
    const padding = Buffer.alloc(pad, pad);
    const finalMsg = Buffer.concat([rawMsg, padding]);

    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    cipher.setAutoPadding(false);
    const encrypted = Buffer.concat([cipher.update(finalMsg), cipher.final()]);
    return encrypted.toString('base64');
  }
}

module.exports = DingCrypto;
