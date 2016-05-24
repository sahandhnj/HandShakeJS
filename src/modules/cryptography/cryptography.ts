import {config,crypto} from './lib';

export module Cryptography{
    export class encryption {
        private NONCE_LENGTH :number = config.crypto.nonceLength/8 || 16;
        private KEY_LENGTH :number = config.crypto.keyLength/8 || 32;

        constructor(){

        }
        
        generateRandomKey(len:number = this.KEY_LENGTH ): string{
            var key = "";
            var possible = config.crypto.keyGenPossibilities;
            for( var i=0; i < len; i++ )
                key += possible.charAt(Math.floor(Math.random() * possible.length));

            return key;
        }
        setCredential(key?:string) : Promise<any | Error>{
            const p: Promise<any | Error> = new Promise (
                (resolve: (cred: any)=>void, reject: (err: Error)=>void) => {
                    try{
                        var cred = {
                            nonce:'',
                            key: ''
                        };

                        //noinspection TypeScriptUnresolvedVariable
                        cred.nonce = crypto.lib.WordArray.random(this.NONCE_LENGTH).toString();

                        (!!key && key.length === this.KEY_LENGTH) ? cred.key = key : cred.key = this.generateRandomKey();
                        if(!!cred.key && !! cred.nonce) resolve(cred);
                        else reject(new Error(config.crypto.errorMessages.credGenFail));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
    }
}
