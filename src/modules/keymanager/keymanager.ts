import {config,JSEncrypt,store,Crypto} from './lib';

export module Keymanager {
    var cr = new Crypto.encryption();
    const enum Status {
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
    export class asymmetricKeys {
        private _pubKey: string;
        private _priKey: string;
        private _status: Status = Status.Initiated;
        private keyStorageId: string = config.keyManagement.keyStorageId;

        constructor(){

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
                            if(this._status === Status.KeysDoesNotExist){
                                let keyGen = new genKeys();
                                return this.storeKeys(keyGen.pubKey,keyGen.priKey);
                            }
                        }).then(()=>{
                           resolve();
                        }).catch((err: any)=>{
                            throw (err);
                        });

                    } catch(err){
                        reject(err);
                    }
                }
            );
            return p;
        }

        get pubKey(): Promise<string | Error> {
            const p: Promise<string | Error> = new Promise (
                (resolve: (pubKey: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!this._pubKey) {
                            cr.decryptAES(this._pubKey,config.keyManagement.masterKey).then(val=>{
                                let tmpPubKey:any = val;
                                resolve(tmpPubKey);
                            }).catch(err=>{throw err});
                        } else throw new Error(config.keyManagement.errorMessages.noPubKey);
                    } catch(err){
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
                            cr.decryptAES(this._priKey,config.keyManagement.masterKey).then(val=>{
                                let tmpPriKey:any = val;
                                resolve(tmpPriKey);
                            }).catch(err=>{throw err});
                        } else throw new Error(config.keyManagement.errorMessages.noPriKey);
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
                        else throw new Error(config.keyManagement.errorMessages.noStatus);
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
                                cr.encryptAES({key:config.keyManagement.masterKey},priKey),
                                cr.encryptAES({key:config.keyManagement.masterKey},pubKey)
                            ];

                            Promise.all(promises).then(val =>{
                              //if(typeof val[0] !== "string" || typeof val[1] !== "string") reject(new Error(config.keyManagement.errorMessages.keyEncryptionFailed));

                                store.set(this.keyStorageId, { publicKey: val[1], privateKey: val[0]});
                                this._pubKey = val[1].toString();
                                this._priKey = val[0].toString();
                                this._status = Status.KeysGenerated;
                                resolve();
                            }).catch(err => {throw err});
                        }
                        else reject(new Error(config.keyManagement.errorMessages.noSetKeyPairs))
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
                        reject(new Error(config.keyManagement.errorMessages.localStorageNoSupport));
                    }
                    else{
                        resolve(null);
                        /*this.removeKeys().then(()=>{
                            resolve(null);
                        })*/
                    }
                }
            );
            return p;
        }

    }

    class genKeys {
        private _pubKey: string;
        private _priKey: string;

        constructor(keySize: keyConfig = {keySize : 2048}) {
            let crypt = new JSEncrypt();
            this._pubKey = crypt.getPublicKey();
            this._priKey = crypt.getPrivateKey();
        }

        get pubKey(): string {
            return this._pubKey;
        }

        get priKey(): string {
            return this._priKey;
        }

    }
};
