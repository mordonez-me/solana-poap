import { clusterApiUrl } from '@solana/web3.js'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import _ from 'lodash'
import { CreateParams, init } from '../src/create'
import { checkRequiredKeys, clusterCommandLine, convertOptionsToCamelCase, privateKeyCommandLine, validateFilesExistenceFromKeys } from './utils'
import chalk from 'chalk'

export default (argv: any) => {

    const cluster = clusterApiUrl("devnet")

    const createCollectionOptionList = [
        privateKeyCommandLine,
        {
            name: 'collection-name',
            alias: 'n',
            type: String,
            description: 'Collection name.',
            typeLabel: '{underline string}',
            group: 'required'
        },
        {
            name: 'image-path',
            alias: 'P',
            type: String,
            description: 'Collection image path',
            typeLabel: '{underline file}',
            group: 'required'
        },
        clusterCommandLine,
        {
            name: 'image-name',
            alias: 'N',
            type: String,
            defaultValue: '',
            description: 'Collection image name.\n{italic Defaults to \'\'.}\n',
            typeLabel: '{underline string}'
        },
        {
            name: 'image-description',
            alias: 'D',
            type: String,
            defaultValue: '',
            description: 'Collection image description.\n{italic Defaults to \'\'.}\n',
            typeLabel: '{underline string}'
        },
    ]

    const createCollectionOptions = commandLineArgs(createCollectionOptionList, { argv })

    const createCollectionDefinitions = [
        {
            header: 'NFT Collection for POAPs',
            content: 'Creates a collection for POAP.'
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
            ['private-key', 'image-path'],
            createCollectionOptions._all
        )

        if (filesExistResult.length > 0) {
            _.forEach(filesExistResult, x => {
                console.log(chalk.red(chalk.bold(`ERROR ====> ${x}`)))
            })
            return
        }

        const data = convertOptionsToCamelCase(createCollectionOptions._all)

        init(data as CreateParams)
    }
}