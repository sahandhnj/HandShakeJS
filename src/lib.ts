declare var Promise: PromiseConstructor;

//noinspection TypeScriptCheckImport
import * as c from './config'

//noinspection TypeScriptCheckImport
import * as J from './lib/jsencrypt.min'

//noinspection TypeScriptCheckImport
import * as S from './lib/store.min'

//noinspection TypeScriptCheckImport
import * as cr from './lib/crypto-js'

export  {c as config} ;
export  {J as JSEncrypt};
export  {S as store};
export  {cr as crypto};

