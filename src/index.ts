import AES from 'crypto-js/aes'
import EncUtf8 from 'crypto-js/enc-utf8'
import stringify from 'json-stringify-safe'
import LZ from 'lz-string'
import { createTransform, Transform, TransformIn, TransformOut } from 'redux-persist'

export interface TransformConfigType {
    whitelist?: Array<string>
    blacklist?: Array<string>
    secretKey: string,
    onError?: (e: Error) => void
}

export default function createCompressEncryptTransform<S>(config: TransformConfigType) {
    if (!config) throw new Error(createErrorMessage("missing config object"))
    const { secretKey, onError } = config
    if (!secretKey || typeof secretKey !== 'string') throw new Error(createErrorMessage("missing secret key from config"))
    if (onError && typeof onError !== 'function') throw new Error(createErrorMessage("onError has to be a function"))

    return createTransform<S, S | string | undefined>(
        createInboundTransform<S>(config),
        createOutboundTransform<S>(config),
        config
    )
}

const createInboundTransform = <S>(config: TransformConfigType): TransformIn<S, S | string | undefined> => (state: S) => {
    const { secretKey, onError } = config
    try {
        if (state == undefined) throw new Error(createErrorMessage(`received invalid state: ${state}`))
        const stringifiedState = stringify(state)
        const compressedState = LZ.compressToBase64(stringifiedState)
        return AES.encrypt(compressedState, secretKey).toString()
    } catch (e) {
        e.message = createErrorMessage("error during persist transformation: " + e.message)
        onError ? onError(e) : console.error(e)
        return state
    }
}

const createOutboundTransform = <S>(config: TransformConfigType): TransformOut<S | string | undefined, S> => (state: any) => {
    const { secretKey, onError } = config

    if (typeof state !== "string") {
        const e = new Error(createErrorMessage("expected outbound state to be a string"))
        onError ? onError(e) : console.error(e)
        return state
    }

    try {
        const decryptedStateString = AES.decrypt(state, secretKey).toString(EncUtf8)
        const decompressedState = LZ.decompressFromBase64(decryptedStateString)
        return JSON.parse(decompressedState)
    } catch (e) {
        e.message = createErrorMessage("error during state reconstruction: " + e.message)
        onError ? onError(e) : console.error(e)
        return state
    }
}

const createErrorMessage = (msg: string) => `redux-persist-transform-compress-encrypt:: ${msg}`