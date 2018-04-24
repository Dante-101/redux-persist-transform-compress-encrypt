# redux-persist-transform-compress-encrypt

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE) [![Build Status](https://travis-ci.org/Dante-101/redux-persist-transform-compress-encrypt.svg?branch=master)](https://travis-ci.org/Dante-101/redux-persist-transform-compress-encrypt)

To persist a compressed and encrypted Redux store

The package creates a transformer for redux-persist. The transformer stringifies the inbound state, compresses it using [`lz-string`](https://github.com/pieroxy/lz-string) and encrypts the compressed string with AES.

## Installation 
```sh
npm install --save redux-persist-transform-compress-encrypt
```

## Usage

```javascript
import { persistReducer } from 'redux-persist'
import createCompressEncryptor from 'redux-persist-transform-compress-encrypt'

const transformer = createCompressEncryptor({
    secretKey: 'secret-key',
    onError: function(error) {
        //fired whenever there is any issue with transformation, 
        //compression or encryption/decryption
    }
})

const reducer = persistReducer({ transforms: [transformer] }, baseReducer)
```

If the package encounters anything unexpected, it skips the transformation, called onError and returns the state as it received.

### Config
Here are all the keys you can pass to `createCompressEncryptor`.
```typescript
interface TransformConfigType {
    //The whitelist and blacklist keys are passed as it is to the 
    //createTransform function
    whitelist?: Array<string>
    blacklist?: Array<string>

    //key for encryption/decryption
    secretKey: string

    //if any error occurs during transformation, this function is called
    onError?: (e: Error) => void
}
```

## Test 
```sh
npm run test
```

## Notes

This package is technically bundling the packages [`redux-persist-transform-compress`](https://github.com/rt2zz/redux-persist-transform-compress) and [`redux-persist-transform-encrypt`](https://github.com/maxdeviant/redux-persist-transform-encrypt) into one. Personally, I could not get them to work together and found it easier to just create my own transform.
