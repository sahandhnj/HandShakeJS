import {config,crypto,JSEncrypt,Util} from './lib';
const debug= Util.util.debug;

export module Cryptography{
    export class AES {
        private static NONCE_LENGTH :number = config.crypto.AES.nonceLength/8 || 12;
        private static KEY_LENGTH :number = config.crypto.AES.keyLength/8 || 32;

        public static async encrypt(cred:{key}, plaintext){
            await this.validateCredKey(cred);

            if(!plaintext){
                throw new Error(config.crypto.AES.errorMessages.noPlainText)
            }

            let cipher = crypto.AES.encrypt(plaintext, cred.key);
            if(!cipher){
                throw new Error(config.crypto.AES.errorMessages.other);
            }

            debug(`AES: Encrypted plaintext:${plaintext} with key:${cred.key} to ${cipher.toString()}`);            
            return cipher.toString();
        }

        public static async encrypt_CTR(cred:{key, nonce}, plaintext){
            let nonce = await this.validateAndDecomposeNonce(cred);
            
            if(!plaintext){
                throw new Error(config.crypto.AES.errorMessages.noPlainText)
            }

            let cipher = crypto.AES.encrypt(plaintext, cred.key, { iv: nonce, mode: crypto.mode.CTR, padding: crypto.pad.NoPadding });
            cipher = cred.nonce + cipher;

            if(!cipher){
                throw new Error(config.crypto.AES.errorMessages.other);
            }

            debug(`AES: Encrypted plaintext:${plaintext} with key:${cred.key}, nonce:${cred.nonce} to ${cipher.toString()}`);            
            return cipher.toString();
        }

        private static async validateKey(key){
            if(!key || key.length !== this.KEY_LENGTH){
                throw new Error(config.crypto.AES.errorMessages.noKEY);
            }
        }

        private static async validateCredKey(cred:{key}){
            if(!cred || !cred.key || cred.key.length !== this.KEY_LENGTH){
                throw new Error(config.crypto.AES.errorMessages.noKEY);
            }
        }

        private static async validateAndDecomposeNonce(cred:{key, nonce}){
           await this.validateCredKey(cred);

           if(!cred.nonce){
               throw new Error(config.crypto.AES.errorMessages.noNONCE);
           }
         
           let nonce = crypto.enc.Hex.parse(cred.nonce);
           if(nonce.words.length !== this.NONCE_LENGTH/4) {
               throw new Error(config.crypto.AES.errorMessages.badNONCESize)
            }

            return nonce;
        }

        public static async decrypt(cipher: string, key:string){
            await this.validateKey(key);

            if(!cipher && cipher.length < 1){
                throw new Error(config.crypto.AES.errorMessages.noCipher);
            }

            let plain = crypto.AES.decrypt(cipher,key);
            plain = plain.toString(crypto.enc.Utf8);

            if(!plain){
                new Error(config.crypto.AES.errorMessages.decryptionFailed)
            }

            debug(`AES: Decrypted cipher:${cipher} with key:${key} to ${plain}`);                        
            return plain;
        }
        
        public static async decrypt_CTR(cipher: string, key:string){
            if(!cipher && cipher.length < 1){
                throw new Error(config.crypto.AES.errorMessages.noCipher);
            }

            const ex:{nonce,cipher} = this.extractNONCE(cipher);
            if(!ex.nonce || (ex.nonce.length !== this.NONCE_LENGTH*2)){
                throw new Error(config.crypto.AES.errorMessages.noNONCE);
            }

            const nonce = crypto.enc.Hex.parse(ex.nonce);

            if(!ex.cipher){
                new Error(config.crypto.AES.errorMessages.noCipher);
            }
            
            await this.validateKey(key);

            let plain = crypto.AES.decrypt(ex.cipher,key,{iv: nonce,mode: crypto.mode.CTR, padding: crypto.pad.NoPadding});
            plain = plain.toString(crypto.enc.Utf8);
            
            if(!plain){
                new Error(config.crypto.AES.errorMessages.decryptionFailed)
            }

            debug(`AES: Decrypted cipher:${ex.cipher}, nonce:${ex.nonce} with key:${key} to ${plain}`);                        
            return plain;
        }

        public static extractNONCE(cipher: string): {nonce,cipher}{
            let result ={
                nonce: "",
                cipher:""
            };

            for (let i=0; i < this.NONCE_LENGTH*2; i++){
                result.nonce += cipher[i];                    
            }

            for (let j=this.NONCE_LENGTH*2; j < cipher.length; j++)
                result.cipher += cipher[j];

            if(!(result.nonce.length == this.NONCE_LENGTH*2 && result.cipher.length > 0)){
                throw new Error(config.crypto.AES.errorMessages.nonceExtractionFail);
            }
            
            return result;
        }

        public static generateRandomKey(len:number = this.KEY_LENGTH ): string{
            let key = "";
            let possible = config.crypto.AES.keyGenPossibilities;

            for(let i=0; i < len; i++ ){
                key += possible.charAt(Math.floor(Math.random() * possible.length));                
            }

            return key;
        }

        public static hex2a(hex:any):string {
            let str = '';

            for (let i = 0; i < hex.length; i += 2){
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));    
            }

            return str;
        }

        public static async setCredential(key?:string){
            let cred = {
                nonce:'',
                key: ''
            };

            cred.nonce = crypto.lib.WordArray.random(this.NONCE_LENGTH).toString();

            (key && key.length === this.KEY_LENGTH) ? cred.key = key : cred.key = this.generateRandomKey();
            if(!cred.key || !cred.nonce) {
                throw new Error(config.crypto.AES.errorMessages.credGenFail);
            }
            
            debug(`AES: Setting credential from ${key}, to cred: ${cred}`);                                    
            return cred;
        }
    }

    export class RSA {
        private static rsaEnc = new JSEncrypt();
        private static rsaDec = new JSEncrypt();

        public static async encrypt(pubKey, plain){
            this.rsaEnc.setPublicKey(pubKey);
            const cipher:string = this.rsaEnc.encrypt(plain);
            
            if(!cipher){
                throw new Error(config.crypto.RSA.errorMessages.encFailed);
            }

            debug(`RSA: Encrypted plain:${plain} to cipher:${cipher}`);
            return cipher;
        }

        public static async decrypt(priKey, cipher){
            this.rsaDec.setPrivateKey(priKey);
            const plain:string = this.rsaDec.decrypt(cipher);

            if(!plain){
                throw new Error(config.crypto.RSA.errorMessages.decFailed)
            }

            debug(`RSA: Decrypted cipher:${cipher} to plain:${plain}`);
            return plain;
        }
    }
}