declare module Keymanager {
    interface keyConfig {
        keySize: number;
    }
    class initiate {
        private _pubKey;
        private _priKey;
        private _status;
        constructor();
        retrievePubKey(): Promise<string | Error>;
        retrievePriKey(): Promise<string | Error>;
        storeKeys(pubKey: string, priKey: string): Promise<Error>;
        initialChecks(): Promise<Error>;
    }
}
