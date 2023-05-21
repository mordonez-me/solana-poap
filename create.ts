import { Metaplex, toBigNumber, toDateTime, toMetaplexFile, BigNumber, SOL, sol, CreateCandyMachineV2Input, CandyMachineConfigLineSettings } from "@metaplex-foundation/js"
import { Keypair, PublicKey } from "@solana/web3.js"
import { cluster, collectionName, candyMachineItemsAvailable, endDate, itemImageAttributes, itemImageDescription, itemImageName, itemImagePath, nameLength, pkPath, itemName, prefixUri, prefixUriLength, startDate, overrideCollection, variablePrefix, collectionImagePath, collectionImageDescription, collectionImageName } from "./settings";
import { getKeypair, initializeMetaplex, getConfigObject, updateConfigInFile } from "./utils"
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";
import * as dotenv from 'dotenv'
import * as fp from 'lodash/fp'
import * as _ from 'lodash'


const fs = require('fs')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.config') })

const uploadMetadata = async (metaplex: Metaplex, imageFile: Buffer, itemImageName: string, itemImageDescription: string, itemImageAttributes: Array<{ trait_type?: string; value?: string;[key: string]: unknown; }>) => {
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: itemImageName,
        image: toMetaplexFile(imageFile, 'poap.png'),
        description: itemImageDescription,
        attributes: itemImageAttributes,
    });
    return uri
}

const createNFT = async (metaplex: Metaplex, keypair: Keypair, uri: string) => {
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

const createCollection = async (metaplex: Metaplex, keypair: Keypair, uri: string) => {

    const collectionNft = await createNFT(metaplex, keypair, uri)
    console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${collectionNft.address.toString()}`);
    return collectionNft
}

const createCandyMachine = async (metaplex: Metaplex, keypair: Keypair, collectionMintPubkey: PublicKey) => {
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
    console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}`);
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

    console.log(`✅ - Items added to Candy Machine: ${candyMachinePubkey.toBase58()}`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}`);

}


const init = async () => {

    const keypair = getKeypair(pkPath)
    const metaplex = initializeMetaplex(cluster, keypair)
    // metaplex.use(nftStorage());

    const poapEnvVariables = getConfigObject(variablePrefix)

    const address = await new Promise<PublicKey>(async (resolve, reject) => {
        const { POAP_COLLECTION_NFT_MINT } = poapEnvVariables
        if (overrideCollection) {
            const uriCollection = await uploadMetadata(
                metaplex,
                fs.readFileSync(collectionImagePath),
                collectionImageName,
                collectionImageDescription,
                []
            )
            const { address } = await createCollection(metaplex, keypair, uriCollection)
            resolve(new PublicKey(address))
        } else {
            resolve(new PublicKey(POAP_COLLECTION_NFT_MINT))
        }
    })

    const candyMachine = await createCandyMachine(metaplex, keypair, address)

    const uriImage = await uploadMetadata(
        metaplex,
        fs.readFileSync(itemImagePath),
        itemImageName,
        itemImageDescription,
        itemImageAttributes
    )
    await addNFTItems(metaplex, candyMachine.address, uriImage)

    const envVariablesWithCollectionMint =
        fp.merge(poapEnvVariables)({
            POAP_COLLECTION_NFT_MINT: address.toBase58(),
            POAP_CANDY_MACHINE_ID: candyMachine.address
        })
    updateConfigInFile(envVariablesWithCollectionMint)

    console.log(`✅✅✅ - Candy Machine created sucessfully`)

}

init()