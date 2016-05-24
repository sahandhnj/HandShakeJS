import {Keymanager} from './modules/keymanager/keymanager';
import {Cryptography} from './modules/cryptography/cryptography';


export module Plekryption {
test();
    
function test():void {
    /***** BEGIM TESTING **********/
    var km = new Keymanager.initiate();
    var cr = new Cryptography.encryption();

    var tmpCred:any;
    var enc:any;
    var dec:any;
    var status:any= km.status;
    var pubKey:any= km.pubKey;
    var priKey:any= km.priKey;
    
    cr.setCredential().then(val =>{
        tmpCred = val;
        return cr.encryptAES_CTR(val,"Awesome Encryption");
    }).then(encs => {
        enc = encs;
        return cr.decryptAES_CTR(encs.toString(),tmpCred.key);
    }).then((res)=>{
        dec = res;
        document.write('<h3>Status</h3><p>'+ status +'</p>');
        document.write('<h3>PublicKey</h3><p>'+ pubKey +'</p>');
        document.write('<h3>PrivateKey</h3><p>'+ priKey +'</p>');
        document.write('<h3>NONCE</h3><p>'+ tmpCred.nonce.toString() +'</p>');
        document.write('<h3>Key</h3><p>'+ tmpCred.key.toString() +'</p>');
        document.write('<h3>Cipher</h3><p>'+ enc +'</p>');
        document.write('<h3>Decrypted</h3><p>'+ dec +'</p>');

    }).catch((err) => {
        alert(err);
    });
    /***** END TESTING **********/
}
}
