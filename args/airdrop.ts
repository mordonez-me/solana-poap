import commandLineUsage from 'command-line-usage'
import commandLineArgs from 'command-line-args'
import { checkRequiredKeys, clusterCommandLine, convertOptionsToCamelCase, privateKeyCommandLine, validateFilesExistenceFromKeys } from './utils'
import _ from 'lodash'
import chalk from 'chalk'
import { AirdropParams, init } from '../src/airdrop'

export default (argv: any) => {
    const createCollectionOptionList = [
        privateKeyCommandLine,
        clusterCommandLine,
        {
            name: 'candy-machine-address',
            alias: 'm',
            type: String,
            description: 'Candy machine address.',
            typeLabel: '{underline string}',
            group: 'required'
        },
        {
            name: 'distribution-list',
            alias: 'd',
            type: String,
            description: 'List of address (one by line) to airdrop an NFT.',
            typeLabel: '{underline string}',
            group: 'required'
        }
    ]
    const createCollectionOptions = commandLineArgs(createCollectionOptionList, { argv })

    const createCollectionDefinitions = [
        {
            header: 'NFT Airdrop for POAPs',
            content: 'Send NFTs from a candy machine.'
        },
        {
            header: 'Required options',
            optionList: createCollectionOptionList,
            group: ['required']
        },
        {
            header: 'Optional (with default values)',
            optionList: createCollectionOptionList,
            group: ['_none']
        }
    ]

    const requiredKeysPresent = checkRequiredKeys(createCollectionOptionList, createCollectionOptions.required)

    if (!requiredKeysPresent) {
        console.log(commandLineUsage(createCollectionDefinitions))
    } else {

        const filesExistResult = validateFilesExistenceFromKeys(
            ['private-key', 'distribution-list'],
            createCollectionOptions._all
        )

        if (filesExistResult.length > 0) {
            _.forEach(filesExistResult, x => {
                console.log(chalk.red(chalk.bold(`ERROR ====> ${x}`)))
            })
            return
        }

        const data = convertOptionsToCamelCase(createCollectionOptions._all)

        init(data as AirdropParams)
    }
}