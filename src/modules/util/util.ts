import { store } from './lib';
import { ILocalStore } from '../../interfaces/localstore';

export module Util{
    export class util {
        public static debug(message:string){
            console.log(message);
        }
    }

    export class LocalStore {
        private currStore;

        constructor(externalStoreHandler?: ILocalStore){
            if(externalStoreHandler){
                this.currStore = externalStoreHandler
            }
            else {
                this.currStore = store;
            }
        }

        public async set(key, data){
            return this.currStore.set(key,data);
        }

        public async get(key){
            return this.currStore.get(key);
        }

        public async remove(key){
            return this.currStore.remove(key);
        }
    }
}
