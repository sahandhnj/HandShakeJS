import {Keymanager} from './modules/keymanager/keymanager';
import {Cryptography} from './modules/cryptography/cryptography';


export module Plekryption {

    export class test{
        private km = new Keymanager.asymmetricKeys();
        private kms = new Keymanager.asymmetricKey();
        private cr = new Cryptography.AES();
        private crr = new Cryptography.RSA();

        private tmpCred:any;
        private enc:any;
        private dec:any;
        private status:any;
        private pubKey:any;
        private priKey:any;
        private chatKey:any;
        private encChatKey:any;
        private decChatKey:any;
        constructor(){
        }


        public chat(msg:string): any {
            this.cr.setCredential(this.decChatKey).then(val =>{
                this.tmpCred = val;
                return this.cr.encrypt_CTR(val,msg);
            }).then(encs => {
                this.enc = encs;
                document.getElementById('stuff').innerHTML += '<hr>'
                document.getElementById('stuff').innerHTML += ('<h3>Cipher</h3><p>'+ this.enc +'</p>');
                document.getElementById('stuff').innerHTML +=('<h3>NONCE</h3><p>'+ this.tmpCred.nonce.toString() +'</p>');
                return this.cr.decrypt_CTR(encs.toString(),this.tmpCred.key);
            }).then((res)=>{
                this.dec = res;
                document.getElementById('stuff').innerHTML +=('<h3>Decrypted</h3><p>'+ this.dec +'</p>');

            }).catch(err => {
                alert(err);
            });
        }

        public set():void {
            /***** BEGIM TESTING **********/


            this.km.initiate().then(()=>{
                var promiseArray = [
                    this.km.pubKey,
                    this.km.priKey,
                    this.km.status
                ];
                return Promise.all(promiseArray);

            }).then(val => {
                this.pubKey = val[0];
                this.priKey= val[1];
                this.status= val[2];
                document.write('<h3>Status</h3><p>'+ this.status +'</p>');
                document.write('<h3>PublicKey</h3><p>'+ this.pubKey +'</p>');
                document.write('<h3>PrivateKey</h3><p>'+ this.priKey +'</p>');

                return this.kms.generateKey();
            }).then((val) =>{
                this.chatKey = val;
                document.write('<h3>ChatKey</h3><p>'+ this.chatKey +'</p>');
                return this.crr.initiate(this.pubKey,this.priKey);
            }).then(() =>{
                return this.crr.encrypt(this.chatKey);
            }).then((val) =>{
                this.encChatKey = val;
                document.write('<h3>Encrypted ChatKey</h3><p>'+ this.encChatKey +'</p>');
                return this.crr.decrypt(this.encChatKey);
            }).then((val) =>{
                this.decChatKey = val;

            }).catch((err) => {
                alert(err);
            });
            /***** END TESTING **********/
        }
    }
    var t = new test();
    t.set();
    //var msg = (<HTMLInputElement>document.getElementById('val')).value;


    window.onload = function () {
        addHtmlForm();
    };
    function addHtmlForm():any{
        var txt = document.createElement("textarea");
        txt.rows = 10;
        txt.cols = 100;
        txt.id = "msg"; // set the CSS class
        document.body.appendChild(txt); // p

        var button = document.createElement('button');
        button.innerText = "Send";
        button.onclick = function () {
            t.chat(txt.value);
        };
        document.body.appendChild(button);
    }


}
