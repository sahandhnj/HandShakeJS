# HandshakeJS

## Introduction
HandshakeJS is a JavaScript library designed to enhance security in web applications through end-to-end encrypted communication. Leveraging modern cryptographic standards, HandshakeJS offers developers an easy-to-use interface for implementing both symmetric and asymmetric encryption directly within their applications. Whether you're building a secure chat application or need to protect sensitive data in transit, HandshakeJS provides the necessary tools to ensure your data remains confidential and secure.

## Features
- **Asymmetric Encryption:** Utilize RSA encryption for secure message exchanges, ensuring that only the intended recipient can decrypt the message.
- **Symmetric Encryption:** Implement AES encryption for efficient, high-speed encryption and decryption of messages.
- **Key Management:** Generate, store, and manage cryptographic keys securely, including both public/private key pairs and symmetric keys.
- **Flexible Configuration:** Customize encryption settings, including key sizes and storage options, to fit the needs of your application.
- **Debugging Support:** Integrated debugging capabilities to assist in development and troubleshooting.

## Basic Usage
### Setting Up Key Management
```bash
import { KeyManager } from 'handshakejs';

// Set up storage for keys (example uses local storage)
KeyManager.asymmetric.setStore(new Util.LocalStore());

// Generate asymmetric keys
await KeyManager.asymmetric.generateKeys();

// Retrieve keys
const keys = await KeyManager.asymmetric.getKeys();
console.log(keys.pubKey, keys.priKey);
```

### Encrypting and Decrypting Messages
```bash
import { Cryptography } from 'handshakejs';

// Encrypt a message using AES
const encryptedMessage = await Cryptography.AES.encrypt({ key: 'your_symmetric_key' }, 'Hello, world!');

// Decrypt the message
const decryptedMessage = await Cryptography.AES.decrypt(encryptedMessage, 'your_symmetric_key');
console.log(decryptedMessage); // 'Hello, world!'
```
