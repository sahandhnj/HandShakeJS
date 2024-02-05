import {config,crypto,JSEncrypt,Util} from './lib';
const debug= Util.util.debug;

export module Cryptography{
    export class AES {
        private static NONCE_LENGTH :number = config.crypto.AES.nonceLength/8 || 12;
        private static KEY_LENGTH :number = config.crypto.AES.keyLength/8 || 32;

        public static async encrypt(cred:{key}, plaintext: string){
            await this.validateCredKey(cred);

            if(!plaintext){
                throw new Error(config.crypto.AES.errorMessages.noPlainText)
            }

            let cipher = crypto.AES.encrypt(plaintext, cred.key);
            if(!cipher){
                throw new Error(config.crypto.AES.errorMessages.other);
            }

            debug(`AES: Encrypted\nplaintext: ${plaintext}\nwith key: ${cred.key}\nto: ${cipher.toString()}`);
            return cipher.toString();
        }

        public static async encrypt_CTR(cred:{key, nonce}, plaintext: string){
            let nonce = await this.validateAndDecomposeNonce(cred);

            if(!plaintext){
                throw new Error(config.crypto.AES.errorMessages.noPlainText)
            }

            let cipher = crypto.AES.encrypt(plaintext, cred.key, { iv: nonce, mode: crypto.mode.CTR, padding: crypto.pad.NoPadding });
            cipher = cred.nonce + cipher;

            if(!cipher){
                throw new Error(config.crypto.AES.errorMessages.other);
            }

            debug(`AES: Encrypted\nplaintext: ${plaintext}\nwith key: ${cred.key}\nnonce: ${cred.nonce}\nto: ${cipher.toString()}`);
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

            if(!cipher || cipher.length < 1){
                throw new Error(config.crypto.AES.errorMessages.noCipher);
            }

            let plain = crypto.AES.decrypt(cipher,key);
            plain = plain.toString(crypto.enc.Utf8);

            if(!plain){
                throw new Error(config.crypto.AES.errorMessages.decryptionFailed)
            }

            debug(`AES: Decrypted\ncipher: ${cipher}\nwith key: ${key}\nto: ${plain}`);
            return plain;
        }

        public static async decrypt_CTR(cipher: string, key:string){
            if(!cipher || cipher.length < 1){
                throw new Error(config.crypto.AES.errorMessages.noCipher);
            }

            const ex:{nonce,cipher} = AES.extractNONCE(cipher);
            if(!ex.nonce || (ex.nonce.length !== this.NONCE_LENGTH*2)){
                throw new Error(config.crypto.AES.errorMessages.noNONCE);
            }

            const nonce = crypto.enc.Hex.parse(ex.nonce);

            if(!ex.cipher){
                throw new Error(config.crypto.AES.errorMessages.noCipher);
            }

            await this.validateKey(key);

            let plain = crypto.AES.decrypt(ex.cipher,key,{iv: nonce,mode: crypto.mode.CTR, padding: crypto.pad.NoPadding});
            plain = plain.toString(crypto.enc.Utf8);

            if(!plain){
                throw new Error(config.crypto.AES.errorMessages.decryptionFailed)
            }

            debug(`AES: Decrypted\ncipher: ${ex.cipher}\nnonce: ${ex.nonce}\nwith key: ${key}\nto: ${plain}`);
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
1
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

            (key && key.length === this.KEY_LENGTH) ? cred.key = key : cred.key = AES.generateRandomKey();
            if(!cred.key || !cred.nonce) {
                throw new Error(config.crypto.AES.errorMessages.credGenFail);
            }

            debug(`AES: Setting credential\nfrom: ${key}\nto cred: ${cred}`);
            return cred;
        }
    }

    export class RSA {

        public static async encrypt(pubKey, plain){
            let rsaEnc = new JSEncrypt();

            rsaEnc.setPublicKey(pubKey);
            const cipher:string = rsaEnc.encrypt(plain);

            if(!cipher){
                throw new Error(config.crypto.RSA.errorMessages.encFailed);
            }

            debug(`RSA: Encrypted\nplain: ${plain}\nto cipher: ${cipher}`);
            return cipher;
        }

        public static async decrypt(priKey, cipher){
            let rsaDec = new JSEncrypt();

            rsaDec.setPrivateKey(priKey);
            const plain:string = rsaDec.decrypt(cipher);

            if(!plain){
                throw new Error(config.crypto.RSA.errorMessages.decFailed)
            }

            debug(`RSA: Decrypted\ncipher: ${cipher}\nto plain: ${plain}`);
            return plain;
        }
    }
}
