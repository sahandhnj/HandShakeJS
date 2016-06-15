import {Crypto,Keymanager} from './lib'

const enum Status {
    noAsymKeys,
    aSymKeysSet,
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
    init(): Promise<Error>{
        const p: Promise<Error> = new Promise<Error> (
            (resolve: ()=>void, reject: (err: Error)=>void) => {
                try{
                    var currErr:Error;
                    this.kmAsym.init().then(()=>{
                        return this.kmAsym.status

                    }).then(st => {
                        if(st === Keymanager.Status.KeysExist)
                            return null;
                        else return st;

                    }).then((st)=>{
                        if (st === Keymanager.Status.KeysDoesNotExist)
                            return this.kmAsym.generateKeys();
                        else return null;

                    }).then(()=>{
                        var promiseArray = [
                            this.kmAsym.pubKey,
                            this.kmAsym.priKey
                        ];
                        return Promise.all(promiseArray).then(val => {
                            if (!!val && !!val[0] && !!val[1]) {
                                this._pubKey = val[0].replace(/(\r\n|\n|\r)/gm,"");
                                this._priKey = val[1].replace(/(\r\n|\n|\r)/gm,"");

                                this._status = Status.aSymKeysSet;
                            }

                        }).then(() =>{
                            return this.crRSA.init(this._pubKey,this._priKey);
                        }).then(() =>{
                            resolve();
                        }).catch(err => {
                            reject(err);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                } catch(err){
                    reject(err);
                }
            }
        );
        return p;
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

    genSymKey():Promise<string | Error> {
        const p: Promise<string | Error> = new Promise<string | Error> (
            (resolve: (enKey: string)=>void, reject: (err: Error)=>void) => {

                var encryptedKey:string = null;
                return this.kmSym.generateKey().then(key =>{
                    if(!!key) {
                        this._currKey = key;
                        if(this._status === Status.aSymKeysSet)
                            this._status = Status.allKeysSet;
                        else
                            this._status = Status.symKeySet;

                        return this.crRSA.encrypt(key);
                    } else
                        return null;
                }).then(encKey => {
                    if(!!encKey) encryptedKey = encKey;
                    resolve(encryptedKey);
                }).catch(err =>{
                    reject(err);
                });
            }
        );
        return p;
    }

    setCurrentKey(encKey: string):Promise<string | Error> {
        const p: Promise<string | Error> = new Promise<string | Error> (
            (resolve: (enKey: string)=>void, reject: (err: Error)=>void) => {
                try{
                    if(encKey !== this._currKey){
                        this.crRSA.decrypt(encKey,this._priKey).then(key => {
                            if(!!key) {
                                this._currKey = key;
                                if(this._status === Status.aSymKeysSet)
                                    this._status = Status.allKeysSet;
                                else
                                    this._status = Status.symKeySet;
                                resolve(this._currKey);
                            } else resolve(null);
                        }).catch(err => {
                            reject(err);
                        });
                    }
                    else resolve(null);
                } catch(err) {
                    reject(err);
                }
            }
        );
        return p;
    }

    encKey(pubKey:string){
        const p: Promise<string> = new Promise<string > (
            (resolve: (enKey: string)=>void) => {
                var tmpcrRSA:any = new Crypto.RSA();
                tmpcrRSA.singleInit(pubKey).then(()=>{
                    return tmpcrRSA.encrypt(this._currKey);
                }).then(encKey => {
                    if(!!encKey) resolve(encKey);
                    else resolve(null);
                });
            }
        );
        return p;
    }

    updateEncKey(pubKey:string, key){
        const p: Promise<string| Errorgit a> = new Promise<string| Error> (
            (resolve: (enKey: string)=>void, reject: (err: Error)=>void) => {
               try{
                   var tmpcrRSA:any = new Crypto.RSA();
                   tmpcrRSA.init(pubKey,this._priKey).then(()=>{
                       return tmpcrRSA.decrypt(key,this._priKey);
                   }).then((decKey)=>{
                       return tmpcrRSA.encrypt(decKey);
                   }).then(encKey => {
                       if(!!encKey) resolve(encKey);
                       else resolve(null);
                   });
               } catch(err){
                   reject(err);
               }
            }
        );
        return p;
    }

    encPlain(plain:string,key:string = this._currKey ){
        const p: Promise<string | Error> = new Promise<string| Error> (
            (resolve: (enKey: string)=>void, reject: (err: Error)=>void) => {
                try{
                    this.setCurrentKey(key).then(() =>{
                        return this.crAES.setCredential(this._currKey);
                    }).then(cred => {
                        if (!!cred) return this.crAES.encrypt(cred, plain);
                        else return null;
                    }).then(encrypted => {
                        if (!!encrypted) resolve(encrypted);
                    }).catch(err => {
                        reject(err);
                    });
                } catch(err){
                    reject(err);
                }
            }
        );
        return p;
    }

    decCipher(cipher:string, key:string = this._currKey){
        const p: Promise<string | Error> = new Promise<string| Error> (
            (resolve: (enKey: string)=>void, reject: (err: Error)=>void) => {
                try{
                    var decrypted:string = null;
                    if(key !== this._currKey){
                        this.crRSA.decrypt(key,this._priKey).then(nkey => {
                            if(!nkey) reject(new Error("The key does not exist"));
                            return  this.crAES.decrypt(cipher,nkey);
                        }).then(decrypted => {
                            if (!!decrypted) resolve(decrypted);
                        }).catch(err => {
                            reject(err);
                        });
                    } else {
                        this.crAES.decrypt(cipher,key).then(decrypted => {
                            if (!!decrypted) resolve(decrypted);
                        }).catch(err => {
                            reject(err);
                        });
                    }
                } catch(err){
                    reject(err);
                }
            }
        );
        return p;
    }
}
