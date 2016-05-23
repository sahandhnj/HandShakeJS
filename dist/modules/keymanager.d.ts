interface keyConfig {
    keySize: number;
}
declare module Keymanager {
    class generate {
        private pubKey;
        private priKey;
        constructor(keySize?: keyConfig);
        test(): void;
    }
}
