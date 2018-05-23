import {config,JSEncrypt,Crypto,Util} from './lib';
const debug= Util.util.debug;

export module Keymanager {
    export interface keyConfig {
        keySize: number;
    }
    export class asymmetric {
        private static keyStorageId: string = config.keyManagement.asymmetric.keyStorageId;
        private static store;

        public static setStore(_store){
            this.store = _store;
        }

        public static async generateKeys(){
            const keyGen = new genAssymetricKeys();
            await this.storeKeysInStorage(keyGen.pubKey, keyGen.priKey);
            debug('New asymmetric keys has been generated');
        }

        public static async getKeys(){
            const pubKey = await this.getPublicKey();
            const priKey = await this.getPrivateKey();

            if(pubKey && priKey){
                return {
                    pubKey,priKey
                }
            }
        }

        public static async getPublicKey(){
            const keys = await this.loadKeysFromStorage();
            let pubKey;

            if(keys && keys.publicKey){
                pubKey = Crypto.AES.decrypt(keys.publicKey,config.keyManagement.asymmetric.masterKey);
            }

            return pubKey;
        }

        public static async getPrivateKey(){
            const keys = await this.loadKeysFromStorage();
            let priKey;

            if(keys && keys.privateKey){
                priKey = Crypto.AES.decrypt(keys.privateKey,config.keyManagement.asymmetric.masterKey);
            }

            return priKey;
        }

        public static async loadKeysFromStorage(){
            let keys = await this.store.get(this.keyStorageId);

            if(!keys){
                keys= {
                    publicKey: null,
                    privateKey: null
                }   
            }
            
            return {
                publicKey: keys.publicKey,
                privateKey: keys.privateKey
            }
        }

        public static async storeKeysInStorage(publicKey, privateKey){
            if(!publicKey || !privateKey){
                throw new Error(config.keyManagement.asymmetric.errorMessages.noSetKeyPairs);
            }

            const pubKey= await Crypto.AES.encrypt({key:config.keyManagement.asymmetric.masterKey},publicKey);
            const priKey= await Crypto.AES.encrypt({key:config.keyManagement.asymmetric.masterKey},privateKey);

            if(!pubKey || !priKey || typeof pubKey !== "string" || typeof priKey !== "string"){
                throw new Error(config.keyManagement.asymmetric.errorMessages.keyEncryptionFailed);
            }

            await this.store.set(this.keyStorageId, { publicKey: pubKey, privateKey: priKey});
            debug('Asymmetric keys has been stored in storage');
        }
        
        public static async removeKeysFromStorage(){
            await this.store.remove(this.keyStorageId);
            debug('Asymmetric keys has been removed from storage');
        }
    }

    export class symmetric{
        private static KEY_LENGTH :number = config.keyManagement.symmetric.keyLength/8 || 32;

        public static async generateKey(len:number = this.KEY_LENGTH ){
            let key = "";
            let possible = config.keyManagement.symmetric.keyGenPossibilities;

            for( let i=0; i < len; i++ ){
                key += possible.charAt(Math.floor(Math.random() * possible.length));                
            }

            if(!key || key.length !== this.KEY_LENGTH){
                throw new Error(config.keyManagement.symmetric.errorMessages.keyGen);
            }
            
            return key;
        }
    }
    class genAssymetricKeys {
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
