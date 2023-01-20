import { CreateCandyMachineInput, DefaultCandyGuardSettings, Metaplex, toBigNumber, toDateTime, toMetaplexFile } from "@metaplex-foundation/js"
import { Keypair, PublicKey } from "@solana/web3.js"
import { cluster, collectionName, collectionSize, endDate, imageName, imagePath, pkPath, startDate } from "./settings";
import { getKeypair, initializeMetaplex } from "./utils"
const fs = require('fs')

const uploadMetadata = async (metaplex: Metaplex, imageFile: Buffer) => {
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: imageName,
        image: toMetaplexFile(imageFile, 'space.png'),
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


const create = async (metaplex: Metaplex, keypair: Keypair, uri: string) => {

    const collectionNft = await createNFT(metaplex, keypair, uri)
    console.log('collectionNft', collectionNft)
    console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${collectionNft.address.toString()}`);
    return collectionNft
}

const createCandyMachine = async (metaplex: Metaplex, keypair: Keypair, collectionMintPubkey: PublicKey) => {
    const candyMachineSettings: CreateCandyMachineInput<DefaultCandyGuardSettings> =
    {
        itemsAvailable: toBigNumber(collectionSize),
        sellerFeeBasisPoints: 0,
        maxEditionSupply: toBigNumber(0),
        isMutable: true,
        creators: [
            { address: keypair.publicKey, share: 100 },
        ],
        collection: {
            address: collectionMintPubkey,
            updateAuthority: keypair,
        },
        guards: {
            startDate: { date: toDateTime(startDate) },
            endDate: { date: toDateTime(endDate) },
        }
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
    const items: any[] = [];
    for (let i = 0; i < collectionSize; i++) {
        items.push({
            name: `Solana Space NFT # ${i + 1}`,
            uri: uri
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

    const imageFile = fs.readFileSync(imagePath)
    const uriCollection = await uploadMetadata(metaplex, imageFile)
    const { address } = await create(metaplex, keypair, uriCollection)

    const candyMachine = await createCandyMachine(metaplex, keypair, address)
    await addNFTItems(metaplex, candyMachine.address, uriCollection)

    const configContent =
        `COLLECTION_NFT_MINT=${address.toBase58()}
        CANDY_MACHINE_ID=${candyMachine.address.toBase58()}`
            .replace(/[^\S\r\n]/g, '')

    fs.writeFile('./.config', configContent, (err: Error) => {
        if (err) {
            console.error(err);
        }
    });

    console.log(`✅✅✅ - Candy Machine created sucessfully`)

}

init()