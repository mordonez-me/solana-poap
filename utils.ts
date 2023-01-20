import { bundlrStorage, keypairIdentity, Metaplex } from "@metaplex-foundation/js"
import { Connection, Keypair } from "@solana/web3.js"
import { configFile, distributionListFile } from "./settings"
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