import {config,crypto} from './lib';

export module Cryptography{
    export class encryption {
        private NONCE_LENGTH :number = config.crypto.nonceLength/8 || 12;
        private KEY_LENGTH :number = config.crypto.keyLength/8 || 32;

        constructor(){

        }
        encryptAES(cred: any,plaintext: string): Promise<Object | Error>{
            const p: Promise<Object | Error> = new Promise (
                (resolve: (cipher: Object)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!cred.key && cred.key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.errorMessages.noKEY));
                        
                        if(!!plaintext) {
                            //noinspection TypeScriptUnresolvedVariable
                            let cipher = crypto.AES.encrypt(plaintext, cred.key);
                            resolve(cipher);
                        } else
                            reject (new Error(config.crypto.errorMessages.noPlainText));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        encryptAES_CTR(cred: any,plaintext: string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        var nonce:any;
                        if(!!cred.nonce) {
                            //noinspection TypeScriptUnresolvedVariable
                            nonce = crypto.enc.Hex.parse(cred.nonce);
                        } else
                            reject(new Error(config.crypto.errorMessages.noNONCE));

                        if(nonce.words.length !== this.NONCE_LENGTH/4) reject(new Error(config.crypto.errorMessages.badNONCESize));

                        if(!cred.key && cred.key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.errorMessages.noKEY));


                        if(!!plaintext) {
                            //noinspection TypeScriptUnresolvedVariable
                            let cipher = crypto.AES.encrypt(plaintext, cred.key, { iv: nonce, mode: crypto.mode.CTR, padding: crypto.pad.NoPadding });
                            resolve(cipher);
                        } else
                            reject (new Error(config.crypto.errorMessages.noPlainText));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        generateRandomKey(len:number = this.KEY_LENGTH ): string{
            let key = "";
            let possible = config.crypto.keyGenPossibilities;
            for( let i=0; i < len; i++ )
                key += possible.charAt(Math.floor(Math.random() * possible.length));

            return key;
        }
        setCredential(key?:string) : Promise<Object | Error>{
            const p: Promise<Object | Error> = new Promise (
                (resolve: (cred: Object)=>void, reject: (err: Error)=>void) => {
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
