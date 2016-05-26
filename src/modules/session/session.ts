import {Crypto,Keymanager} from './lib'

export module Session{
    const enum Status {
        noAsymKeys,
        aSymKeysSet,
        noSymKey,
        symKeySet,
        allKeysSet
    }
    export class session{
        private _pubKey:string;
        private _priKey:string;
        private _currKey:string;
        private _status:Status = Status.noAsymKeys;

        private kmAsym:any;
        private kmSym:any;
        private crAES:any;
        private crRSA:any;

        constructor(){
            this.kmAsym = new Keymanager.asymmetric();
            this.kmSym = new Keymanager.symmetric();

            this.crAES = new Crypto.AES();
            this.crRSA = new Crypto.RSA();
        }
        async init(){
            try {
                var currErr:Error;
                await this.kmAsym.init().then(()=>{
                    return this.kmAsym.status

                }).then(st => {
                    if(st === Keymanager.Status.KeysExist) {
                        return null;
                    } else return st;

                }).then((st)=>{
                    if (st === Keymanager.Status.KeysDoesNotExist)
                        return this.kmAsym.generateKeys();
                    else return null;

                }).then(()=>{
                    var promiseArray = [
                        this.kmAsym.pubKey,
                        this.kmAsym.priKey
                    ];
                    Promise.all(promiseArray).then(val => {
                        if (!!val && !!val[0] && !!val[1]) {
                            this._pubKey = val[0];
                            this._priKey = val[1];
                            this._status = Status.aSymKeysSet;
                        }
                        return this.crRSA.init(this._pubKey,this._priKey);
                    }).catch(err => {
                        currErr = err;
                        return null;
                    })
                }).catch(err => {
                    currErr = err;
                });
                if (!!currErr) throw(currErr);
            } catch(err){
                throw(err);
            }

        }
        get pubKey():string{
            if(!!this._pubKey) return this._pubKey;
            else return null;
        }
        get priKey():string{
            if(!!this._priKey) return this._priKey;
            else return null;
        }
        get currKey():string{
            if(!!this._currKey) return this._currKey;
            else return null;
        }
        get status():number{
            if(!!this._status) return this._status;
            else return null;
        }

        async genSymKey() {
            try{
                var currErr:Error;
                var encryptedKey:string = null;
                await this.kmSym.generateKey().then(key =>{
                    if(!!key) {
                        this._currKey = key;
                        return this.crRSA.encrypt(key);
                    } else
                        return null;
                }).then(encKey => {
                    if(!!encKey) encryptedKey = encKey;
                }).catch(err =>{
                    currErr = err;
                });
                if (!!currErr) throw(currErr);
                return encryptedKey;
            } catch (err) {
                throw (err);
            }
        }

        async setCurrentKey(encKey: string) {
            try{
                var currErr:Error;
                await this.crRSA.decrypt(encKey).then(key => {
                    if(!!key) this._currKey = key;
                }).catch(err => {
                    currErr = err;
                });
                if(currErr) throw (currErr);
            } catch (err) {
                throw (err);
            }
        }

        async encKey(pubKey:string, key:string = this._currKey){
            try{
                var currErr:Error;
                var tmpcrRSA:any = new Crypto.RSA();
                var encKey:string = null;
                await tmpcrRSA.singleInit(pubKey).then(()=>{
                    return tmpcrRSA.encrypt(key);
                }).then(val => {
                    if(!!val) encKey = val;
                }).catch(err => {
                    currErr = err;
                });
                if(currErr) throw (currErr);
                return encKey;
            } catch (err) {
                throw (err);
            }
        }

        async encPlain(plain:string){
            try{
                var currErr:Error;
                var encrypted:string = null;

                await this.crAES.setCredential(this._currKey).then(cred => {
                    if (!!cred) return this.crAES.encrypt_CTR(cred, plain);
                    else return null;
                }).then(val => {
                    if (!!val) encrypted = val;
                }).catch(err => {
                    currErr = err;
                });
                if(currErr) throw (currErr);
                return encrypted;
            } catch (err) {
                throw (err);
            }
        }

        async decCipher(cipher:string, key:string = this._currKey){
            try{
                var currErr:Error;
                var decrypted:string = null;

                await this.crAES.decrypt_CTR(cipher,key).then(val => {
                    if (!!val) decrypted = val;
                }).catch(err => {
                    currErr = err;
                });
                if(currErr) throw (currErr);
                return decrypted;
            } catch (err) {
                throw (err);
            }
        }
    }
}
