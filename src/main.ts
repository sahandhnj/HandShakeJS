import {Crypto,Keymanager,Util,ILocalStore} from './lib'
import { Stats } from 'fs';
import { keyManagement } from './config';
const debug= Util.util.debug;

const enum Status {
    noAsymKeys,
    aSymKeysSet,
    symKeySet,
    allKeysSet
}

export class session{
    private _pubKey:string;
    private _priKey:string;
    private _symKey:string;
    private _status:Status = Status.noAsymKeys;
    private _store:ILocalStore;


    constructor(){
        // (async () => {
        //     try {                
        //         const keys = await Keymanager.asymmetric.getKeys();

        //         if(keys && keys.pubKey && keys.priKey){
        //             this._pubKey= keys.pubKey;
        //             this._priKey= keys.priKey;
        //             this._status= Status.aSymKeysSet;
        //         }
                
        //         debug(`Status: ${this._status}`);
        //     } catch (e) {
        //         console.log(`Issue: ${e}`);
        //     }
        // })();
    }

    public async initiate(store?: ILocalStore){
        try {
            const newStore = new Util.LocalStore(store);
            Keymanager.asymmetric.setStore(newStore);

            const keys = await Keymanager.asymmetric.getKeys();

            if(keys && keys.pubKey && keys.priKey){
                this._pubKey= keys.pubKey;
                this._priKey= keys.priKey;
                this._status= Status.aSymKeysSet;
            }

            if(this.getStatus() === 0){
                await this.generateKeys();
            }
            
            debug(`Status: ${this._status}`);
        } catch (e) {
            console.log(e);
            //console.log(`Issue: ${e}`);
        }
    }

    public async generateKeys(){
        await Keymanager.asymmetric.generateKeys();
        this._status= Status.aSymKeysSet;
    }

    public getStatus(){
        return this._status;
    }

    public async generateSymKey(){
        const symKey= await Keymanager.symmetric.generateKey();
        let symKeyEncrypted;

        if(symKey){
            this._symKey = symKey;
            this._status = (this._status === Status.aSymKeysSet) ? Status.allKeysSet : Status.symKeySet;
            symKeyEncrypted= await Crypto.RSA.encrypt(this._pubKey, symKey);

            return symKeyEncrypted;
        }
    }

    public async setSymKey(symKeyEncrypted){
        const symKey= await Crypto.RSA.decrypt(this._priKey,symKeyEncrypted);

        if(symKey){
            this._symKey = symKey;
        }
    }

    public async getSymKey(){
        if(this._symKey){
            const symKeyEncrypted= await Crypto.RSA.encrypt(this._pubKey, this._symKey);
            return symKeyEncrypted;
        }
    }

    public async updateSymKey(symKeyEncrypted, publicKey){
        const symKey= await Crypto.RSA.decrypt(this._priKey,symKeyEncrypted);

        if(symKey){
            const symKeyEncrypted= await Crypto.RSA.encrypt(publicKey, this._symKey);
            return symKeyEncrypted;
        }
    }

    public async encrypt(message){
        const creds = await Crypto.AES.setCredential(this._symKey)
        const cipher= await Crypto.AES.encrypt(creds,message);
        
        return cipher;
    }

    public async decrypt(message){
        const creds = await Crypto.AES.setCredential(this._symKey)
        const cipher= await Crypto.AES.decrypt(message,creds.key);
        
        return cipher;
    }
}
