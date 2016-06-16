import {config,crypto,JSEncrypt} from './lib';

export module Cryptography{
    export class AES {
        private NONCE_LENGTH :number = config.crypto.AES.nonceLength/8 || 12;
        private KEY_LENGTH :number = config.crypto.AES.keyLength/8 || 32;

        constructor(){

        }
        encrypt(cred: any,plaintext: string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise<string | Error> (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!cred.key && cred.key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.AES.errorMessages.noKEY));

                        if(!!plaintext) {
                            //noinspection TypeScriptUnresolvedVariable
                            let cipher = crypto.AES.encrypt(plaintext, cred.key);
                            cipher = cipher.toString();
                            (!!cipher) ? resolve(cipher) : reject (new Error(config.crypto.AES.errorMessages.other));

                        } else
                            reject (new Error(config.crypto.AES.errorMessages.noPlainText));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        encrypt_CTR(cred: any,plaintext: string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise<string | Error> (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        var nonce:any;
                        if(!!cred.nonce) {
                            //noinspection TypeScriptUnresolvedVariable
                            nonce = crypto.enc.Hex.parse(cred.nonce);
                        } else
                            reject(new Error(config.crypto.AES.errorMessages.noNONCE));

                        if(nonce.words.length !== this.NONCE_LENGTH/4) reject(new Error(config.crypto.AES.errorMessages.badNONCESize));

                        if(!cred.key && cred.key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.AES.errorMessages.noKEY));

                        if(!!plaintext) {
                            //noinspection TypeScriptUnresolvedVariable
                            let cipher = crypto.AES.encrypt(plaintext, cred.key, { iv: nonce, mode: crypto.mode.CTR, padding: crypto.pad.NoPadding });
                            cipher = cred.nonce + cipher;

                            (!!cipher) ? resolve(cipher) : reject (new Error(config.crypto.AES.errorMessages.other));
                        } else
                            reject (new Error(config.crypto.AES.errorMessages.noPlainText));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        decrypt_CTR(cipher: string, key:string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise<string | Error> (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!!cipher && cipher.length > 0){
                            var ex:any = this.extractNONCE(cipher);
                            if(typeof ex == "Error") reject(ex);
                        }
                        else reject(new Error(config.crypto.AES.errorMessages.noCipher));
                        if(!!ex.nonce || (ex.nonce.length === this.NONCE_LENGTH*2)){
                            //noinspection TypeScriptUnresolvedVariable
                            var nonce = crypto.enc.Hex.parse(ex.nonce);
                        }
                        else
                            reject(new Error(config.crypto.AES.errorMessages.noNONCE));

                        if(!ex.cipher) reject(new Error(config.crypto.AES.errorMessages.noCipher));

                        if(!key && key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.AES.errorMessages.noKEY));


                        //noinspection TypeScriptUnresolvedVariable
                        var plain = crypto.AES.decrypt(ex.cipher,key,{iv: nonce,mode: crypto.mode.CTR, padding: crypto.pad.NoPadding});

                        //noinspection TypeScriptUnresolvedVariable
                        plain = plain.toString(crypto.enc.Utf8);
                        (!!plain) ? resolve(plain) : reject (new Error(config.crypto.AES.errorMessages.decryptionFailed));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
        decrypt(cipher: string, key:string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise<string | Error> (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try{
                        if(!cipher) reject(new Error(config.crypto.AES.errorMessages.noCipher));

                        if(!key && key.length !== this.KEY_LENGTH)
                            reject(new Error(config.crypto.AES.errorMessages.noKEY));
                        console.log("decrypting with, ",key);
                        //noinspection TypeScriptUnresolvedVariable
                        let plain = crypto.AES.decrypt(cipher,key);
                        //noinspection TypeScriptUnresolvedVariable
                        plain = plain.toString(crypto.enc.Utf8);
                        (!!plain) ? resolve(plain) : reject (new Error(config.crypto.AES.errorMessages.decryptionFailed));

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
                else return(new Error(config.crypto.AES.errorMessages.nonceExtractionFail));

            } catch(err) {
                return(err);
            }
        }
        generateRandomKey(len:number = this.KEY_LENGTH ): string{
            let key = "";
            let possible = config.crypto.AES.keyGenPossibilities;
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
            const p: Promise<Object | Error> = new Promise<Object | Error> (
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
                        else reject(new Error(config.crypto.AES.errorMessages.credGenFail));

                    } catch(err) {
                        reject(err);
                    }
                });
            return p;
        }
    }
    export class RSA {
        private rsaEnc:any;
        private rsaDec:any;
        constructor(){
            this.rsaEnc = new JSEncrypt();
            this.rsaDec = new JSEncrypt();
        }
        init(pubKey:string, priKey:string): Promise<Error>{
            const p: Promise<Error> = new Promise<Error> (
                (resolve: ()=>void, reject: (err: Error)=>void) => {
                    try{
                        this.rsaEnc.setPublicKey(pubKey);
                        this.rsaDec.setPrivateKey(priKey);

                        if(!!this.rsaEnc && !!this.rsaDec) resolve();
                        else reject(new Error(config.crypto.RSA.errorMessages.initiationFialed));
                    } catch (err) { reject(err); }
                }
            );
            return p;
        }
        singleInit(pubKey:string): Promise<Error>{
            const p: Promise<Error> = new Promise<Error> (
                (resolve: ()=>void, reject: (err: Error)=>void) => {
                    try{
                        this.rsaEnc.setPublicKey(pubKey);

                        if(!!this.rsaEnc) resolve();
                        else reject(new Error(config.crypto.RSA.errorMessages.initiationFialed));
                    } catch (err) { reject(err); }
                }
            );
            return p;
        }
        encrypt(plain:string,pubKey:string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise<string | Error> (
                (resolve: (cipher: string)=>void, reject: (err: Error)=>void) => {
                    try {
                        if(!!pubKey){
                            var rsaEnc = new JSEncrypt();
                            rsaEnc.setPublicKey(pubKey);

                            if(!rsaEnc) reject(new Error(config.crypto.RSA.errorMessages.noPubKey));
                            var encrypted:string = rsaEnc.encrypt(plain);

                            if(!!encrypted) resolve(encrypted);
                            else reject(new Error(config.crypto.RSA.errorMessages.encFailed));
                        } else reject(new Error(config.crypto.RSA.errorMessages.noPubKey));
                    } catch (err) { reject(err); }
                }
            );
            return p;
        }
        decrypt(cipher:string,priKey:string): Promise<string | Error>{
            const p: Promise<string | Error> = new Promise<string | Error> (
                (resolve: (plain: string)=>void, reject: (err: Error)=>void) => {
                    try {
                        if(!!priKey){
                            var rsaDec = new JSEncrypt();
                            rsaDec.setPrivateKey(priKey);

                            if(!rsaDec) reject(new Error(config.crypto.RSA.errorMessages.noPriKey));
                            var decrypted:string = rsaDec.decrypt(cipher);

                            if(!!decrypted) resolve(decrypted);
                            else resolve(null);//reject(new Error(config.crypto.RSA.errorMessages.decFailed));
                        }else reject(new Error(config.crypto.RSA.errorMessages.noPriKey));
                    } catch (err) { reject(err); }
                }
            );
            return p;
        }
    }
}
