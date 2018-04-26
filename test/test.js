const expect = require('chai').expect
const createCompressEncryptTransform = require('../dist/index.js').default

describe('redux persist transform ', () => {
    const secretKey = 'sample test key 1'
    const onError = (e) => {
        expect.fail(e, undefined, "unexpected error: " + e.message)
    }

    const transform = createCompressEncryptTransform({ secretKey: secretKey, onError })

    const validateTranformation = (state) => {
        const persistString = transform.in(state)
        expect(typeof persistString == 'string').to.be.true
        expect(persistString).to.not.eq(state)
        const reconstructedState = transform.out(persistString)
        expect(reconstructedState).to.deep.eq(state)
    }

    it('config not supplied', () => {
        try {
            createCompressEncryptTransform()
            expect.fail()
        } catch (e) { }
    })
    it('missing secret key', () => {
        try {
            createCompressEncryptTransform({})
            expect.fail()
        } catch (e) { }
    })
    it('invalid onError value', () => {
        try {
            createCompressEncryptTransform({ secretKey, onError: 'error' })
            expect.fail()
        } catch (e) { }
    })

    it('object encrypt and decrypt', () => {
        validateTranformation({
            stringKey: "string value!",
            objectKey: { obj: {} },
            numberKey: 42
        })
    })

    it('string encrypt and decrypt', () => { validateTranformation("sample string from another transformer") })

    it('undefined encrypt should return undefined', () => {
        const newTransform = createCompressEncryptTransform({
            secretKey: secretKey,
            onError: () => { }
        })
        const persistString = newTransform.in(undefined)
        expect(persistString).to.not.exist
    })

    it('undefined decrypt should return undefined', () => {
        const newTransform = createCompressEncryptTransform({
            secretKey: secretKey,
            onError: () => { }
        })
        const persistString = newTransform.out(undefined)
        expect(persistString).to.not.exist
    })

    it('undefined decrypt should error', (done) => {
        const handle = setTimeout(() => { done("error did not fire") }, 100)
        const newTransform = createCompressEncryptTransform({
            secretKey: secretKey,
            onError: (e) => {
                clearTimeout(handle)
                done()
            }
        })
        newTransform.out(undefined)
    })

    //The next two tests are flipper tests. 
    //Ideally I want it to throw but they throw error about 1 in 7 tmes and rest of the time they don't throw
    //Issue tracked here: https://github.com/brix/crypto-js/issues/158
    it.skip('random text decryption with legit key should error', (done) => {
        const handle = setTimeout(() => { done("error did not fire") }, 100)
        const newTransform = createCompressEncryptTransform({
            secretKey,
            onError: (e) => {
                clearTimeout(handle)
                done()
            }
        })
        newTransform.out("asdfglka iu8to3u8o97as asd  a slkdufa")
    })

    it.skip('changing the secret key for outbound should return empty', () => {
        const persistString = transform.in("random test string")
        const newTransform = createCompressEncryptTransform({
            secretKey: "random secret key - " + Math.random(),
            onError
        })
        const reconstructedState = newTransform.out(persistString)
        expect(reconstructedState).to.not.exist
    })
})