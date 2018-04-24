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

    it('undefined encrypt should error', (done) => {
        const handle = setTimeout(() => { done("error did not fire") }, 100)
        const newTransform = createCompressEncryptTransform({
            secretKey: secretKey,
            onError: (e) => {
                clearTimeout(handle)
                done()
            }
        })
        newTransform.in(undefined)
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

    it('changing the secret key for outbound should return empty', () => {
        const persistString = transform.in("random test string")
        const newTransform = createCompressEncryptTransform({
            secretKey: "random secret key - " + Math.random(),
            onError
        })
        const reconstructedState = newTransform.out(persistString)
        expect(reconstructedState).to.not.exist
    })
})