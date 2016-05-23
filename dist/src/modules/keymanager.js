var Keymanager;
(function (Keymanager) {
    class initiate {
        constructor() {
            this._status = 0 /* Initiated */;
            var arrayOfPromise = [
                this.initialChecks(),
                this.retrievePubKey(),
                this.retrievePriKey()
            ];
            Promise.all(arrayOfPromise).then(val => {
                if (!!val[1] && !!val[2])
                    this._status = 1 /* KeysExist */;
                else
                    this._status = 2 /* KeysDoesNotExist */;
            }).then(() => {
                if (this._status === 2 /* KeysDoesNotExist */) {
                    let keyGen = new genKeys();
                    this._status = 3 /* KeysGenerated */;
                    return this.storeKeys(keyGen.pubKey, keyGen.priKey);
                }
            }).then(() => {
                document.write('<h3>Status</h3><p>' + this._status + '</p>');
                document.write('<h3>PublicKey</h3><p>' + this._pubKey + '</p>');
                document.write('<h3>PrivateKey</h3><p>' + this._priKey + '</p>');
            }).catch((err) => {
                alert(err);
            });
        }
        retrievePubKey() {
            const p = new Promise((resolve, reject) => {
                try {
                    let res = store.get("keys");
                    if (!!res && !!res.publicKey) {
                        this._pubKey = res.publicKey;
                        resolve(res.publicKey);
                    }
                    else
                        resolve(null);
                }
                catch (err) {
                    reject(err);
                }
            });
            return p;
        }
        retrievePriKey() {
            const p = new Promise((resolve, reject) => {
                try {
                    let res = store.get("keys");
                    if (!!res && !!res.privateKey) {
                        this._priKey = res.privateKey;
                        resolve(res.privateKey);
                    }
                    else
                        resolve(null);
                }
                catch (err) {
                    reject(err);
                }
            });
            return p;
        }
        storeKeys(pubKey, priKey) {
            const p = new Promise((resolve, reject) => {
                try {
                    if (!!pubKey && !!priKey) {
                        store.set('keys', { publicKey: pubKey, privateKey: priKey });
                        this._pubKey = pubKey;
                        this._priKey = priKey;
                        resolve();
                    }
                    reject(new Error('public/private keys are not set.'));
                }
                catch (err) {
                    reject(err);
                }
            });
            return p;
        }
        initialChecks() {
            const p = new Promise((resolve, reject) => {
                if (!store.enabled) {
                    this._status = 5 /* Failed */;
                    reject(new Error('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.'));
                }
                else
                    resolve(null);
            });
            return p;
        }
    }
    Keymanager.initiate = initiate;
    class genKeys {
        constructor(keySize = { keySize: 2048 }) {
            let crypt = new JSEncrypt();
            this._pubKey = crypt.getPublicKey();
            this._priKey = crypt.getPrivateKey();
        }
        get pubKey() {
            return this._pubKey;
        }
        get priKey() {
            return this._priKey;
        }
    }
})(Keymanager || (Keymanager = {}));
;
//# sourceMappingURL=keymanager.js.map