import {Crypto,Keymanager,Util} from './lib'
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

    public async initiate(){
        try {                
            const keys = await Keymanager.asymmetric.getKeys();

            if(keys && keys.pubKey && keys.priKey){
                this._pubKey= keys.pubKey;
                this._priKey= keys.priKey;
                this._status= Status.aSymKeysSet;
            }

        } catch (e) {
            debug(`Issue: ${e}`);
        }
    }

    private setAsymKeys(keys){
        
    }

    public async generateKeys(){
        try{
            await Keymanager.asymmetric.generateKeys();
            const keys = await Keymanager.asymmetric.getKeys();
          
            this._pubKey= keys.pubKey;
            this._priKey= keys.priKey;
            this._status= Status.aSymKeysSet;
        }
        catch(e){
            debug(e);
        }
        
    }

    public getStatus(){
        return this._status;
    }

    public async generateSymKey(){
        try{
            const symKey= await Keymanager.symmetric.generateKey();
            let symKeyEncrypted;
    
            if(symKey){
                this._symKey = symKey;
                this._status = (this._status === Status.aSymKeysSet) ? Status.allKeysSet : Status.symKeySet;
                symKeyEncrypted= await Crypto.RSA.encrypt(this._pubKey, symKey);
    
                return symKeyEncrypted;
            }
        }
        catch(e){
            debug(e);
        }
       
    }

    public async setSymKey(symKeyEncrypted){
        try {
            const symKey= await Crypto.RSA.decrypt(this._priKey,symKeyEncrypted);

            if(symKey){
                this._symKey = symKey;
            }
        }
        catch(e){
            debug(e);
        }
    }

    public async getSymKey(){
        try{
            if(this._symKey){
                const symKeyEncrypted= await Crypto.RSA.encrypt(this._pubKey, this._symKey);
                return symKeyEncrypted;
            }
        }
        catch(e){
            debug(e);
        }
    }

    public async updateSymKey(symKeyEncrypted, publicKey, oldSymKey){
        try{
            const symKey= await Crypto.RSA.decrypt(this._priKey,symKeyEncrypted);

            if(symKey){
                const symKeyToUpdate = oldSymKey ? symKey : this._symKey;
                const symKeyEncrypted= await Crypto.RSA.encrypt(publicKey, symKeyToUpdate);
                return symKeyEncrypted;
            }
        }
        catch(e){
            debug(e);
        }
    }

    public async encrypt(message){
        try{
            const creds = await Crypto.AES.setCredential(this._symKey)
            const cipher= await Crypto.AES.encrypt(creds,message);
            
            return cipher;
        }
        catch(e){
            debug(e);
        }
    }

    public async decrypt(message){
        try{
            const creds = await Crypto.AES.setCredential(this._symKey)
            const cipher= await Crypto.AES.decrypt(message,creds.key);

            return cipher;
        }
        catch(e){
            debug(e);
        }
        
    }
}
