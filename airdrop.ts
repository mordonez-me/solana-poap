import { Metaplex } from "@metaplex-foundation/js";
import { Keypair, PublicKey } from "@solana/web3.js"
import { cluster, pkPath } from "./settings"
import { getDistributionList, getKeypair, initializeMetaplex, parseConfig } from "./utils"
const fs = require('fs')

const mintToUser = async (metaplex: Metaplex, keypair: Keypair, userAddress: string, candyMachineAddress: string, logFileError: string, logFileSuccess: string) => {

    const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: new PublicKey(candyMachineAddress) });

    return metaplex.candyMachines().mint({
        candyMachine,
        owner: new PublicKey(userAddress),
        collectionUpdateAuthority: keypair.publicKey
    }, { commitment: 'finalized', payer: keypair })
}

const init = async () => {
    const keypair = getKeypair(pkPath)
    const metaplex = initializeMetaplex(cluster, keypair)

    const { POAP_CANDY_MACHINE_ID } = parseConfig()

    const distributionList = getDistributionList()
    const time = Date.now()

    const logFileError = `${POAP_CANDY_MACHINE_ID}_${time}.error`
    const logFileSuccess = `${POAP_CANDY_MACHINE_ID}_${time}.success`

    const promises = distributionList.map((address: string) => {

        return mintToUser(metaplex, keypair, address, POAP_CANDY_MACHINE_ID, logFileError, logFileSuccess)
            .then(result => {
                let { nft, response } = result
                fs.appendFileSync(logFileSuccess, address + '\n')

                console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
                console.log(`     https://explorer.solana.com/address/${nft.address.toString()}`);
                console.log(`     https://explorer.solana.com/tx/${response.signature}`);
            })
            .catch(e => {
                console.log(e)
                fs.appendFileSync(logFileError, address + '\n');
                console.log(`🔴 - User address ${address} not minted`);
            })
    })

    await Promise.all(promises)

    console.log(`✅✅✅ - Candy Machine distributed finished`)

}

init()