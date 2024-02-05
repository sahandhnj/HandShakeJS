const keyManagementJSON = {
    asymmetric:{
        masterKey: "J]oIc0M$A~*im+XOOK+K[2L4N6alEbk(",
        keyStorageId: "keys",
        errorMessages:  {
            noSetKeyPairs: "public/private keys are not set.",
            localStorageNoSupport: "Local storage is not supported by your browser. Please disable Private Mode or upgrade to a modern browser.",
            keyEncryptionFailed: "Public and Private keys cannot be encrypted.",
            noPubKey: "No Public key is set",
            noPriKey: "No Private key is set",
            noStatus: "No Status key is set",
            keysNotGen: "Asymmetric keys can not be generated"
        }
    },
    symmetric:{
        keyLength:256,
        keyGenPossibilities:"!@$%^&*()_+=-[]{}`~,.?/|;:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        errorMessages:  {
            keyGen: "Key cannot be generated"
        }
    }

};
const cryptoJSON = {
    AES: {
        nonceLength:96,
        keyLength:256,
        keyGenPossibilities:"!@$%^&*()_+=-[]{}`~,.?/|;:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        errorMessages: {
            credGenFail: "Key or NONCE cannot be generated",
            noNONCE: "NONCE is required for the encryption/decryption",
            badNONCESize:"The size of NONCE Does not match the encryption algorithm",
            noKEY: "KEY is required for the encryption/decryption",
            noPlainText: "Plain Text is required for the encryption",
            other: "Cipher could not be generated",
            nonceExtractionFail:"Could not extract NONCE and Cipher",
            noCipher:"A Cipher is required for decryption",
            decryptionFailed: "For unknown reasons decryption failed"
        }
    },
    RSA: {
        errorMessages:{
            initiationFailed: "can not initiate the rsa process",
            encFailed: "can not encrypt the plain text via rsa",
            decFailed: "can not decrypt the cipher via rsa",
            noPubKey: "No Public key is set, Initiate first",
            noPriKey: "No Private key is set, Initiate first"
        }
    }

};

export {keyManagementJSON as keyManagement};
export {cryptoJSON as crypto};

