var keyManagementJSON = {
    keyStorageId: "keys",
    errorMessages:  {
        noSetKeyPairs: "public/private keys are not set.",
        localStorageNoSupport: "Local storage is not supported by your browser. Please disable Private Mode or upgrade to a modern browser."
    }
};
var cryptoJSON = {
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
};

export {keyManagementJSON as keyManagement};
export {cryptoJSON as crypto};

