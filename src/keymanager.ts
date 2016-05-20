interface keyConfig {
  keySize: number;
}

declare function require(path: string) : any;
var JSEncrypt = require('../jsencrypt');

module Keymanager {
  interface keyConfig {
    keySize: number
  }
  export class generate {
    private pubKey: string;
    private priKey: string;
    constructor(keySize: keyConfig = {keySize : 2048}) {
      var crypt = new JSEncrypt();
      var keys = { priv: crypt.getPrivateKey(), pub: crypt.getPublicKey() };
      alert(keys);
    }
  }
};
