import { CandyMachineConfigLineSettings, Metaplex, PublicKey, sol, toBigNumber } from "@metaplex-foundation/js";
import { candyMachineItemsAvailable, nameLength, prefixUri, prefixUriLength, variablePrefix } from "../settings"
import { getConfigObject, getKeypair, initializeMetaplex, updateConfigInFile, uploadMetadata } from "./utils"
import * as fp from 'lodash/fp'
import { Keypair } from "@solana/web3.js";
import chalk from "chalk";

const fs = require('fs')

const createCandyMachine = async (metaplex: Metaplex, keypair: Keypair, collectionMintPubkey: PublicKey, itemName: string) => {
    const itemSettings: CandyMachineConfigLineSettings = {
        type: 'configLines',
        prefixName: itemName + ' #$ID+1$',
        nameLength: nameLength,
        prefixUri: prefixUri,
        uriLength: prefixUriLength,
        isSequential: true,
    }
    const candyMachineSettings =
    {
        itemsAvailable: toBigNumber(candyMachineItemsAvailable),
        itemSettings,
        sellerFeeBasisPoints: 0,
        maxEditionSupply: toBigNumber(0),
        isMutable: true,
        creators: [
            { address: keypair.publicKey, share: 100, verified: true },
        ],
        collection: {
            address: collectionMintPubkey,
            updateAuthority: keypair
        },
        authority: keypair,
        price: sol(0)
        // guards: {
        //     startDate: { date: toDateTime(startDate) },
        //     endDate: { date: toDateTime(endDate) },
        // }
    };
    const { candyMachine } = await metaplex.candyMachines().create(candyMachineSettings, { commitment: 'finalized' });
    return candyMachine
}

const addNFTItems = async (metaplex: Metaplex, candyMachinePubkey: PublicKey, uri: string) => {
    const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: candyMachinePubkey });
    const piecesUri = uri.split('/')
    const uriId = piecesUri[piecesUri.length - 1]
    const items: any[] = [];
    for (let i = 0; i < candyMachineItemsAvailable; i++) {
        items.push({
            name: '',
            index: i,
            uri: uriId
        })
    }
    const { response } = await metaplex.candyMachines().insertItems({
        candyMachine,
        items: items,
    }, { commitment: 'finalized' });

    // console.log(`✅ - Items added to Candy Machine: ${candyMachinePubkey.toBase58()}`);
    // console.log(`     https://explorer.solana.com/tx/${response.signature}`);

}

export interface CreateCandyMachineParams {
    privateKey: string;
    cluster: string;
    collectionAddress: string;
    quantity: number;
    itemName: string;
    imagePath: string;
    imageName: string;
    imageDescription: string;
    attributes?: string;
}


export const init = async (params: CreateCandyMachineParams) => {
    const { privateKey, cluster, collectionAddress, itemName, imagePath, imageName, imageDescription, attributes } = params

    const keypair = getKeypair(privateKey)
    const metaplex = initializeMetaplex(cluster, keypair)

    const candyMachine = await createCandyMachine(
        metaplex, keypair, new PublicKey(collectionAddress), itemName)

    const uriImage = await uploadMetadata(
        metaplex,
        fs.readFileSync(imagePath),
        imageName,
        imageDescription,
        attributes ? JSON.parse(attributes) : []
    )
    await addNFTItems(metaplex, candyMachine.address, uriImage)

    console.log('✅ - ' + chalk.green(`Candy Machine Address: ${candyMachine.address.toString()}`));
}
