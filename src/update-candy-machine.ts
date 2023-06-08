import { CandyMachine, CandyMachineConfigLineSettings, DefaultCandyGuardMintSettings, Metaplex, PublicKey, sol, toBigNumber } from "@metaplex-foundation/js";
import { nameLength, prefixUri, prefixUriLength } from "../settings"
import { getKeypair, initializeMetaplex, uploadMetadata } from "./utils"
import { Keypair } from "@solana/web3.js";
import chalk from "chalk";

const fs = require('fs')

const updateCandyMachine = async (metaplex: Metaplex, keypair: Keypair, collectionMintPubkey: PublicKey, candyMachine: CandyMachine, itemName: string, quantity: number) => {
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
        candyMachine: candyMachine,
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

    const updateCandyMachineOutput = await metaplex.candyMachines().update(candyMachineSettings, { commitment: 'finalized' });
    return updateCandyMachineOutput.response.signature
}

const addNFTItems = async (metaplex: Metaplex, candyMachinePubkey: PublicKey, uri: string, quantity: number) => {
    const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: candyMachinePubkey });
    const piecesUri = uri.split('/')
    const uriId = piecesUri[piecesUri.length - 1]
    const items: any[] = [];
    for (let i = 0; i < quantity; i++) {
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

export interface UpdateCandyMachineParams {
    privateKey: string;
    cluster: string;
    collectionAddress: string;
    candyMachineAddress: string;
    quantity: number;
    itemName: string;
    imagePath: string;
    imageName: string;
    imageDescription: string;
    attributes?: string;
}


export const init = async (params: UpdateCandyMachineParams) => {
    const { privateKey, cluster, collectionAddress, candyMachineAddress, quantity, itemName, imagePath, imageName, imageDescription, attributes } = params

    const keypair = getKeypair(privateKey)
    const metaplex = initializeMetaplex(cluster, keypair)

    const candyMachineAddressPublicKey = new PublicKey(candyMachineAddress)

    const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: candyMachineAddressPublicKey });


    candyMachine

    await updateCandyMachine(
        metaplex, keypair, new PublicKey(collectionAddress), candyMachine, itemName, quantity)

    const uriImage = await uploadMetadata(
        metaplex,
        fs.readFileSync(imagePath),
        imageName,
        imageDescription,
        attributes ? JSON.parse(attributes) : []
    )
    await addNFTItems(metaplex, candyMachineAddressPublicKey, uriImage, quantity)

    console.log('✅ - ' + chalk.green(`Candy Machine Address: ${candyMachineAddress}`));
    console.log('✅ - ' + chalk.green(`Candy Machine Address: ${candyMachineAddressPublicKey.toBase58()}`));
}
