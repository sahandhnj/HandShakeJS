interface keyConfig {
  keySize: number;
}

module Keymanager {
  export class generate {
    private pubKey: string;
    private priKey: string;
    constructor(keySize: keyConfig = {keySize : 2048}) {
      var crypt = new JSEncrypt();
      this.pubKey = crypt.getPublicKey();
      this.priKey = crypt.getPrivateKey();
    }
    test(){
      document.write(this.pubKey);
    }
  }
};
