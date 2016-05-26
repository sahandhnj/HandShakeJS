import {config,JSEncrypt,store,Crypto} from './lib';

export module Keymanager {
    export const enum Status {
        Initiated,
        KeysExist,
        KeysDoesNotExist,
        KeysGenerated,
        Other,
        Failed
    }
    export interface keyConfig {
        keySize: number;
    }
    export class asymmetric {
        private _pubKey: string;
        private _priKey: string;
        private _status: Status = Status.Initiated;
        private keyStorageId: string = config.keyManagement.asymmetric.keyStorageId;
        private cr:any;


        constructor(){
            this.cr = new Crypto.AES();
        }
        initiate(): Promise<Error> {
            const p: Promise<Error> = new Promise (
                (resolve: ()=>void, reject: (err: Error)=>void) => {
                    try{
                        var arrayOfPromise = [
                            this.initialChecks(),
                            this.retrievePubKey(),
                            this.retrievePriKey()
                        ];

                        Promise.all(arrayOfPromise).then(val =>{
                            if(!!val[1] && !!val[2]) this._status = Status.KeysExist;
                            else this._status = Status.KeysDoesNotExist;
                        }).then(()=>{
                           resolve();
                        }).catch((err: any)=>{
                            reject(err);
                        });

                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        generateKeys(): Promise<Error>{
            const p: Promise<string | Error> = new Promise(
                (resolve: () => void, reject: (err: Error)=>void) => {
                    try{
                        if(this._status === Status.KeysDoesNotExist) {
                            let keyGen = new genKeys();

                            this.storeKeys(keyGen.pubKey, keyGen.priKey).then(() => {
                                if(!!this._priKey && !!this._priKey && this._status === Status.KeysGenerated){
                                    this._status = Status.KeysExist;
                                    resolve();
                                } else {reject(new Error(config.keyManagement.asymmetric.errorMessages.keysNotGen))}
                            }).catch((err) => {reject(err);})
                        }
                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        get pubKey(): Promise<string | Error> {
            const p: Promise<string | Error> = new Promise (
                (resolve: (pubKey: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!this._pubKey) {
                            this.cr.decrypt(this._pubKey,config.keyManagement.asymmetric.masterKey).then(val=>{
                                let tmpPubKey:any = val;
                                resolve(tmpPubKey);
                            }).catch(err=>{ reject(err); });
                        } else reject(new Error(config.keyManagement.asymmetric.errorMessages.noPubKey));
                    } catch(err) {
                        reject(err);
                    }
                }
            );
            return p;
        }

        get priKey(): Promise<string | Error> {
            const p: Promise<string | Error> = new Promise (
                (resolve: (priKey: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!this._priKey) {
                            this.cr.decrypt(this._priKey, config.keyManagement.asymmetric.masterKey).then(val=> {
                                let tmpPriKey:any = val;
                                resolve(tmpPriKey);
                            }).catch(err=> {
                                reject(err)
                            });
                        } else reject(new Error(config.keyManagement.asymmetric.errorMessages.noStatus));
                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        get status(): Promise<number | Error> {
            const p: Promise<number | Error> = new Promise (
                (resolve: (status: number)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!this._status) resolve(this._status);
                        else throw new Error(config.keyManagement.asymmetric.errorMessages.noStatus);
                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        retrievePubKey(): Promise<string | Error> {
            const p: Promise<string | Error> = new Promise (
                (resolve: (str: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        let res = store.get(this.keyStorageId);
                        if(!!res && !!res.publicKey){
                            this._pubKey = res.publicKey;
                            resolve(res.publicKey);
                        } else
                            resolve(null);
                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        retrievePriKey(): Promise<string | Error> {
            const p: Promise<string | Error> = new Promise (
                (resolve: (str: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        let res = store.get(this.keyStorageId);
                        if(!!res && !!res.privateKey){
                            this._priKey = res.privateKey;
                            resolve(res.privateKey);
                        } else
                            resolve(null);
                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        removeKeys(): Promise<Error> {
            const p: Promise<Error> = new Promise (
                (resolve: ()=>void, reject: (err: Error)=>void) => {
                    try{
                        store.remove(this.keyStorageId);
                        resolve();
                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        storeKeys(pubKey: string, priKey: string): Promise<Error> {
            const p: Promise<Error> = new Promise (
                (resolve: ()=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!pubKey && !!priKey ){
                            var promises: Promise<string | Error>[] = [
                                this.cr.encrypt({key:config.keyManagement.asymmetric.masterKey},priKey),
                                this.cr.encrypt({key:config.keyManagement.asymmetric.masterKey},pubKey)
                            ];

                            Promise.all(promises).then(val =>{
                                if(typeof val[0] !== "string" || typeof val[1] !== "string")
                                  reject(new Error(config.keyManagement.asymmetric.errorMessages.keyEncryptionFailed));

                                store.set(this.keyStorageId, { publicKey: val[1], privateKey: val[0]});
                                this._pubKey = val[1].toString();
                                this._priKey = val[0].toString();
                                this._status = Status.KeysGenerated;
                                resolve();
                            }).catch(err => { reject(err); });
                        }
                        else reject(new Error(config.keyManagement.asymmetric.errorMessages.noSetKeyPairs))
                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        initialChecks() : Promise<Error> {
            const p: Promise<Error> = new Promise (
                (resolve: (n: any)=>void, reject: (err: Error)=>void) => {
                    if (!store.enabled){
                        this._status = Status.Failed;
                        reject(new Error(config.keyManagement.asymmetric.errorMessages.localStorageNoSupport));
                    }
                    else{
                        //resolve(null);
                        this.removeKeys().then(()=>{
                            resolve(null);
                        }).catch(err => { reject(err); });
                    }
                }
            );
            return p;
        }
    }

    export class symmetric{
        private KEY_LENGTH :number = config.keyManagement.symmetric.keyLength/8 || 32;

        generateKey(len:number = this.KEY_LENGTH ): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise (
                (resolve: (key: string)=>void, reject: (err: Error)=>void) => {
                    let key = "";
                    let possible = config.keyManagement.symmetric.keyGenPossibilities;
                    for( let i=0; i < len; i++ )
                        key += possible.charAt(Math.floor(Math.random() * possible.length));

                    if(!!key && key.length === this.KEY_LENGTH) resolve(key);
                    else reject(new Error(config.keyManagement.symmetric.errorMessages.keyGen));
                }
            );
            return p;
        }
    }

    class genKeys {
        private _pubKey: string;
        private _priKey: string;

        constructor(keySize: keyConfig = {keySize : 2048}) {
            let jsen = new JSEncrypt();
            this._pubKey = jsen.getPublicKey();
            this._priKey = jsen.getPrivateKey();
        }

        get pubKey(): string {
            return this._pubKey;
        }

        get priKey(): string {
            return this._priKey;
        }

    }
};
