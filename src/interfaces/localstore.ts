export interface ILocalStore {
    set(key,data): void,
    get(key): {publicKey, privateKey},
    remove(key): void
}