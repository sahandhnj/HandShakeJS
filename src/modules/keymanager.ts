module Keymanager {

    //var config = require('json!./config.json');
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
    export class initiate {
        private _pubKey: string;
        private _priKey: string;
        private _status: Status = Status.Initiated;

        constructor(){

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
                    this._status = Status.KeysGenerated;
                    return this.storeKeys(keyGen.pubKey,keyGen.priKey);
                }
            }).then(()=>{
                document.write('<h3>Status</h3><p>'+ this._status +'</p>');
                document.write('<h3>PublicKey</h3><p>'+ this._pubKey +'</p>');
                document.write('<h3>PrivateKey</h3><p>'+ this._priKey +'</p>');
            }).catch((err: any)=>{
                alert (err);
            });
            
        }

        retrievePubKey(): Promise<string | Error> {
            const p: Promise<string | Error> = new Promise (
                (resolve: (str: string)=>void, reject: (str: Error)=>void) => {
                    try{
                        let res = store.get("keys");
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
                (resolve: (str: string)=>void, reject: (str: Error)=>void) => {
                    try{
                        let res = store.get("keys");
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

        storeKeys(pubKey: string, priKey: string): Promise<Error> {
            const p: Promise<Error> = new Promise (
                (resolve: ()=>void, reject: (str: Error)=>void) => {
                    try{
                        if(!!pubKey && !!priKey ){
                            store.set('keys', { publicKey: pubKey, privateKey: priKey });
                            this._pubKey = pubKey;
                            this._priKey = priKey;
                            resolve();
                        }
                        reject(new Error('public/private keys are not set.'))
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
                        reject(new Error('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.'));
                    }
                    else resolve(null);
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
