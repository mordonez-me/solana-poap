import { bundlrStorage, keypairIdentity, Metaplex } from "@metaplex-foundation/js"
import { Connection, Keypair } from "@solana/web3.js"
import { configFile, distributionListFile } from "./settings"
import { Dictionary } from 'lodash'
import * as fp from 'lodash/fp'

const dotenv = require('dotenv')
const fs = require('fs')


export const getKeypair = (path: string): Keypair => {
    const fileContent = fs.readFileSync(path, 'utf8')
    const pk = new Uint8Array(JSON.parse(fileContent))
    return Keypair.fromSecretKey(pk)
}

export const initializeMetaplex = (cluster: string, keypair: Keypair) => {
    const connection = new Connection(cluster);
    return Metaplex.make(connection)
        .use(keypairIdentity(keypair))
        .use(bundlrStorage({
            address: 'https://devnet.bundlr.network', // remove this to use main
        }));
}

export const parseConfig = () => {
    const fileContent = fs.readFileSync(configFile, 'utf8')
    const buf = Buffer.from(fileContent)
    return dotenv.parse(buf)
}

export const getDistributionList = () => {
    const fileContent = fs.readFileSync(distributionListFile, 'utf8')
    const list = fileContent.split(/\n/)
    return list
}

export const getConfigObject = (variablePrefix: string): Dictionary<object> => {
    return fp.pickBy((value: any, key: string) => {
        return key.slice(0, variablePrefix.length) == variablePrefix
    })(process.env)
}

export const updateConfigInFile = (poapEnvVariables: Dictionary<object>) => {
    const configContentUpdated = fp.reduce((acc, curr) => {
        return `${acc}${curr[0]}=${curr[1]}\n`
    }, '', fp.entries(poapEnvVariables))

    console.log('configContentUpdated', configContentUpdated)
    fs.writeFile('./.config', configContentUpdated, (err: Error) => {
        if (err) {
            console.error(err);
        }
    });
}