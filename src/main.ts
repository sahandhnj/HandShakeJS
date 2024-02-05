import {Crypto, ILocalStore, Keymanager, Util} from './lib'

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

        } catch (e) {
            debug(`Issue: ${e}`);
        }
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

            if(symKey){
                this._symKey = symKey;
                this._status = (this._status === Status.aSymKeysSet) ? Status.allKeysSet : Status.symKeySet;
                return  await Crypto.RSA.encrypt(this._pubKey, symKey);
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
                return await Crypto.RSA.encrypt(this._pubKey, this._symKey);
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
                return await Crypto.RSA.encrypt(publicKey, symKeyToUpdate);
            }
        }
        catch(e){
            debug(e);
        }
    }

    public async encrypt(message){
        try{
            const creds = await Crypto.AES.setCredential(this._symKey)
            return await Crypto.AES.encrypt(creds, message);
        }
        catch(e){
            debug(e);
        }
    }

    public async decrypt(message, encryptedSymKey?){
        try{
            let symKeyToBeProcessed = this._symKey;

            if(encryptedSymKey){
                symKeyToBeProcessed = await Crypto.RSA.decrypt(this._priKey,encryptedSymKey);
            }

            const creds = await Crypto.AES.setCredential(symKeyToBeProcessed)
            return await Crypto.AES.decrypt(message, creds.key);
        }
        catch(e){
            debug(e);
        }

    }
}
