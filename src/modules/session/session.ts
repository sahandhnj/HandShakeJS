import {Crypto,Keymanager} from './lib'

export module Session{
    var cr = new Crypto.AES();
    const enum Status {
        noAsymKeys,
        aSymKeysSet,
        noSymKey,
        symKeySet,
        allKeysSet
    }
    export class session{
        private _pubKey:string ;
        private _priKey:string;
        private _currKey:string;
        private _status:Status = Status.noAsymKeys;

        private kmA:any;
        private kmS:any;

        constructor(){
            this.kmA = new Keymanager.asymmetric();
            this.kmS = new Keymanager.symmetric();
        }
        async init(){
            try {
                var currErr:Error;
                await this.kmA.initiate().then(()=>{
                    return this.kmA.status

                }).then(st => {
                    if(st === Keymanager.Status.KeysExist) {
                        return null;
                    } else return st;

                }).then((st)=>{
                    if (st === Keymanager.Status.KeysDoesNotExist)
                        return this.kmA.generateKeys();
                    else return null;

                }).then(()=>{
                    var promiseArray = [
                        this.kmA.pubKey,
                        this.kmA.priKey
                    ];
                    Promise.all(promiseArray).then(val => {
                        if (!!val && !!val[0] && !!val[1]) {
                            this._pubKey = val[0];
                            this._priKey = val[1];
                            this._status = Status.aSymKeysSet;
                        }
                        return;
                    }).catch(err => {
                        currErr = err;
                        return;
                    })
                }).catch(err => {
                    currErr = err;
                });
                if (!!currErr) throw currErr;
            } catch(err){
                alert(err);
            }
        }
        get pubKey():string{
            return this._pubKey;
        }
        get priKey():string{
            return this._priKey;
        }
        get status():number{
            return this._status;
        }
    }
}
