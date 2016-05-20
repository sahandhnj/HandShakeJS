var JSEncrypt = require('../jsencrypt');
var Keymanager;
(function (Keymanager) {
    var generate = (function () {
        function generate(keySize) {
            if (keySize === void 0) { keySize = { keySize: 2048 }; }
            var crypt = new JSEncrypt();
            var keys = { priv: crypt.getPrivateKey(), pub: crypt.getPublicKey() };
            alert(keys);
        }
        return generate;
    }());
    Keymanager.generate = generate;
})(Keymanager || (Keymanager = {}));
;

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
