declare var Promise: PromiseConstructor;

//noinspection TypeScriptCheckImport
import * as c from './config'

//noinspection TypeScriptCheckImport
import * as J from '../bower_components/jsencrypt/bin/jsencrypt.min'

//noinspection TypeScriptCheckImport
import * as S from './lib/store.min'

//noinspection TypeScriptCheckImport
import * as cr from './lib/crypto-js'

import {Cryptography} from './modules/cryptography/cryptography'
import {Keymanager} from  './modules/keymanager/keymanager'


export  {Cryptography as Crypto};
export  {Keymanager as Keymanager};
export  {c as config} ;
export  {J as JSEncrypt};
export  {S as store};
export  {cr as crypto};

