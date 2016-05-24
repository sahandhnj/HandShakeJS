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
                            (!!cipher) ? resolve(cipher) : reject (new Error(config.crypto.errorMessages.other));

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
                            cipher = cred.nonce + cipher;

                            (!!cipher) ? resolve(cipher) : reject (new Error(config.crypto.errorMessages.other));
                        } else
                            reject (new Error(config.crypto.errorMessages.noPlainText));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        decryptAES_CTR(cipher: string, key:string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!cipher && cipher.length > 0){
                            var ex:any = this.extractNONCE(cipher);
                            if(typeof ex == "Error") reject(ex);
                        }
                        else reject(new Error(config.crypto.errorMessages.noCipher));
                        if(!!ex.nonce || (ex.nonce.length === this.NONCE_LENGTH*2)){
                            //noinspection TypeScriptUnresolvedVariable
                            var nonce = crypto.enc.Hex.parse(ex.nonce);
                        }
                        else                          
                            reject(new Error(config.crypto.errorMessages.noNONCE));

                        if(!ex.cipher) reject(new Error(config.crypto.errorMessages.noCipher));

                        if(!key && key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.errorMessages.noKEY));
                        

                        //noinspection TypeScriptUnresolvedVariable
                        var plain = crypto.AES.decrypt(ex.cipher,key,{iv: nonce,mode: crypto.mode.CTR, padding: crypto.pad.NoPadding});
                        
                        //noinspection TypeScriptUnresolvedVariable
                        plain = plain.toString(crypto.enc.Utf8);
                        (!!plain) ? resolve(plain) : reject (new Error(config.crypto.errorMessages.decryptionFailed));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        decryptAES(cipher: string, key:string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!cipher) reject(new Error(config.crypto.errorMessages.noCipher));

                        if(!key && key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.errorMessages.noKEY));

                        //noinspection TypeScriptUnresolvedVariable
                        let plain = crypto.AES.decrypt(cipher,key);
                        //noinspection TypeScriptUnresolvedVariable
                        plain = plain.toString(crypto.enc.Utf8);
                        (!!plain) ? resolve(plain) : reject (new Error(config.crypto.errorMessages.decryptionFailed));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        extractNONCE(cipher: string): (Object | Error){
            try{
                var res ={
                    nonce: "",
                    cipher:""
                };
                for (var i=0; i < this.NONCE_LENGTH*2; i++)
                    res.nonce += cipher[i];

                for (var j=this.NONCE_LENGTH*2; j < cipher.length; j++)
                    res.cipher += cipher[j];

                if(res.nonce.length == this.NONCE_LENGTH*2 && res.cipher.length > 0)  return(res) ;
                else return(new Error(config.crypto.errorMessages.nonceExtractionFail));

            } catch(err) {
                return(err);
            }
        }
        generateRandomKey(len:number = this.KEY_LENGTH ): string{
            let key = "";
            let possible = config.crypto.keyGenPossibilities;
            for( let i=0; i < len; i++ )
                key += possible.charAt(Math.floor(Math.random() * possible.length));

            return key;
        }
        hex2a(hex:any):string {
            var str = '';
            for (var i = 0; i < hex.length; i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return str;
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
