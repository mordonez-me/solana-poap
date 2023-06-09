import { CandyMachineConfigLineSettings, Metaplex, PublicKey, sol, toBigNumber } from "@metaplex-foundation/js";
import { nameLength, prefixUri, prefixUriLength } from "../settings"
import { getKeypair, initializeMetaplex, uploadMetadata } from "./utils"
import { Keypair } from "@solana/web3.js";
import chalk from "chalk";

const fs = require('fs')

const createCandyMachine = async (metaplex: Metaplex, keypair: Keypair, collectionMintPubkey: PublicKey, itemName: string, quantity: number) => {
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
        itemsAvailable: toBigNumber(quantity),
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
        price: sol(0),
        // guards: {
        //     mintLimit: { id: 1, limit: 5 },
        // }
    };
    const { candyMachine } = await metaplex.candyMachines().create(candyMachineSettings, { commitment: 'finalized' });
    return candyMachine
}

const addNFTItems = async (metaplex: Metaplex, candyMachinePubkey: PublicKey, uri: string, quantity: number) => {
    const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: candyMachinePubkey });
    const piecesUri = uri.split('/')
    const uriId = piecesUri[piecesUri.length - 1]


    const groupSize = 15
    const groups = Math.ceil(quantity / groupSize)

    for (let index = 0; index < groups; index++) {

        console.log("Starting group", index + 1)
        const items: any[] = [];
        const diff = groupSize * index

        for (let i = 0; i < groupSize; i++) {
            console.log(i + diff, uriId)
            items.push({
                name: '',
                index: i + diff,
                uri: uriId
            })
        }


        const { response } = await metaplex.candyMachines().insertItems({
            candyMachine,
            items: items,
        }, { commitment: 'finalized' });

        console.log(`✅ - Items added to Candy Machine: ${candyMachinePubkey.toBase58()}`);
        console.log(`     https://explorer.solana.com/tx/${response.signature}`);

    }

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
    const { privateKey, cluster, collectionAddress, quantity, itemName, imagePath, imageName, imageDescription, attributes } = params

    const keypair = getKeypair(privateKey)
    const metaplex = initializeMetaplex(cluster, keypair)

    const candyMachine = await createCandyMachine(
        metaplex, keypair, new PublicKey(collectionAddress), itemName, quantity)

    const uriImage = await uploadMetadata(
        metaplex,
        fs.readFileSync(imagePath),
        imageName,
        imageDescription,
        attributes ? JSON.parse(attributes) : []
    )
    await addNFTItems(metaplex, candyMachine.address, uriImage, quantity)

    console.log('✅ - ' + chalk.green(`Candy Machine Address: ${candyMachine.address.toString()}`));
}
