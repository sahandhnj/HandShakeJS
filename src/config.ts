var keyManagementJSON = {
    keyStorageId: "keys",
    errorMessages:  {
        noSetKeyPairs:"public/private keys are not set.",
        localStorageNoSupport: "Local storage is not supported by your browser. Please disable Private Mode or upgrade to a modern browser."
    }
};
var cryptoJSON = {
    nonceLength:96,
    keyLength:256,
    keyGenPossibilities:"!@$%^&*()_+=-[]{}`~,.?/|;:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    errorMessages: {
        credGenFail:"Key or IV cannot be generated"
    }
};

export {keyManagementJSON as keyManagement};
export {cryptoJSON as crypto};

