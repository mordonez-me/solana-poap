import { Metaplex } from "@metaplex-foundation/js";
import { Keypair, PublicKey } from "@solana/web3.js"
import { getDistributionList, getKeypair, initializeMetaplex } from "./utils"
import chalk from "chalk";
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

export interface AirdropParams {
    privateKey: string;
    cluster: string;
    candyMachineAddress: string;
    distributionList: string;
}

export const init = async (params: AirdropParams) => {
    const { privateKey, cluster, candyMachineAddress, distributionList } = params
    const keypair = getKeypair(privateKey)
    const metaplex = initializeMetaplex(cluster, keypair)

    const distributionListArray = getDistributionList(distributionList)
    const time = Date.now()

    const logFileError = `logs/${candyMachineAddress}_${time}.error`
    const logFileSuccess = `logs/${candyMachineAddress}_${time}.success`

    const promises = distributionListArray.map((address: string) => {

        return mintToUser(metaplex, keypair, address, candyMachineAddress, logFileError, logFileSuccess)
            .then(async result => {
                console.log(result)
                let { nft, response } = result






                // const approve = await metaplex.tokens().approveDelegateAuthority({
                //     mintAddress: nft.mint.address,
                //     delegateAuthority: keypair.publicKey,
                //     tokenAddress: nft.token.address
                // })

                // console.log('approve', approve)

                // const freeze = await freezeDelegatedNftOperation({
                //     mintAddress: nft.mint.address,
                //     delegateAuthority: keypair
                // } as FreezeDelegatedNftInput)

                // console.log('freeze', freeze)

                fs.appendFileSync(logFileSuccess, address + '\n')

                console.log('✅ - ' + chalk.green(`Minted NFT: ${nft.address.toString()}`));
            })
            .catch(e => {
                console.log(e)
                fs.appendFileSync(logFileError, address + '\n');
                console.log('🔴 - ' + chalk.red(`User address ${address} not minted`));
            })
    })

    await Promise.all(promises)

    console.log(`✅ - Candy Machine distributed finished`)

}