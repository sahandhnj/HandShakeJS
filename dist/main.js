var Plekryption;
(function (Plekryption) {
    var HelloWorld = (function () {
        function HelloWorld() {
            alert('Hello World');
        }
        return HelloWorld;
    }());
    Plekryption.HelloWorld = HelloWorld;
})(Plekryption || (Plekryption = {}));

var Keymanager;
(function (Keymanager) {
    var generate = (function () {
        function generate(keySize) {
            if (keySize === void 0) { keySize = { keySize: 2048 }; }
            var crypt = new JSEncrypt();
            this.pubKey = crypt.getPublicKey();
            this.priKey = crypt.getPrivateKey();
        }
        generate.prototype.test = function () {
            document.write(this.pubKey);
        };
        return generate;
    }());
    Keymanager.generate = generate;
})(Keymanager || (Keymanager = {}));
;
