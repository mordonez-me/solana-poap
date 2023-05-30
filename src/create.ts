import { Metaplex } from "@metaplex-foundation/js"
import { Keypair, PublicKey } from "@solana/web3.js"
import { variablePrefix } from "../settings";
import { getKeypair, initializeMetaplex, getConfigObject, updateConfigInFile, uploadMetadata } from "./utils"
import * as dotenv from 'dotenv'
import * as fp from 'lodash/fp'
import * as _ from 'lodash'
import * as fs from 'fs'
import * as path from 'path'
import chalk from "chalk";


const createNFT = async (metaplex: Metaplex, keypair: Keypair, uri: string, collectionName: string) => {
    const { nft } = await metaplex.nfts().create({
        uri: uri,
        name: collectionName,
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: keypair
    }, { commitment: 'finalized' });
    return nft
}

// Run functions

const createCollection = async (metaplex: Metaplex, keypair: Keypair, uri: string, collectionName: string) => {

    const collectionNft = await createNFT(metaplex, keypair, uri, collectionName)
    return collectionNft
}

export interface CreateParams {
    privateKey: string;
    cluster: string;
    collectionName: string;
    imagePath: string;
    imageName: string;
    imageDescription: string;
}

export const init = async (params: CreateParams) => {

    const { privateKey, cluster, collectionName, imagePath, imageName, imageDescription } = params

    const keypair = getKeypair(privateKey)
    const metaplex = initializeMetaplex(cluster, keypair)

    const uriCollection = await uploadMetadata(
        metaplex,
        fs.readFileSync(imagePath),
        imageName,
        imageDescription,
        []
    )
    const { address } = await createCollection(metaplex, keypair, uriCollection, collectionName)
    console.log('✅ - ' + chalk.green(`Collection NFT Address: ${address.toString()}`));

}