import { bundlrStorage, keypairIdentity, Metaplex, toMetaplexFile } from "@metaplex-foundation/js"
import { Connection, Keypair } from "@solana/web3.js"
import { Dictionary } from 'lodash'
import * as fp from 'lodash/fp'
import * as fs from 'fs'


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

export const getDistributionList = (distributionListFile: string) => {
    const fileContent = fs.readFileSync(distributionListFile, 'utf8')
    const list = fileContent.split(/\n/)
    return list
}

export const getConfigObject = (variablePrefix: string): Dictionary<object> => {
    return fp.pickBy((value: any, key: string) => {
        return key.slice(0, variablePrefix.length) == variablePrefix
    })(process.env)
}

export const updateConfigInFile = (poapEnvVariables: Dictionary<object>, filePath: string) => {
    const configContentUpdated = fp.reduce((acc, curr) => {
        return `${acc}${curr[0]}=${curr[1]}\n`
    }, '', fp.entries(poapEnvVariables))

    fs.writeFileSync(filePath, configContentUpdated, { encoding: "utf8", flag: "w", mode: 0o666 })
}

export const uploadMetadata = async (metaplex: Metaplex, imageFile: Buffer, itemImageName: string, itemImageDescription: string, itemImageAttributes: Array<{ trait_type?: string; value?: string;[key: string]: unknown; }>) => {
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: itemImageName,
        image: toMetaplexFile(imageFile, 'poap.png'),
        description: itemImageDescription,
        attributes: itemImageAttributes,
    });
    return uri
}