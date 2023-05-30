import commandLineUsage from 'command-line-usage'
import commandLineArgs from 'command-line-args'
import { checkRequiredKeys, clusterCommandLine, convertOptionsToCamelCase, privateKeyCommandLine, validateFilesExistenceFromKeys } from './utils'
import _ from 'lodash'
import chalk from 'chalk'
import { CreateCandyMachineParams, init } from '../src/candy-machine'

export default (argv: any) => {
    const createCollectionOptionList = [
        privateKeyCommandLine,
        clusterCommandLine,
        {
            name: 'collection-address',
            alias: 'a',
            type: String,
            description: 'Collection address.',
            typeLabel: '{underline string}',
            group: 'required'
        },
        {
            name: 'quantity',
            alias: 'q',
            type: Number,
            description: 'Quantity of items in the candy machine (items to be minted).',
            typeLabel: '{underline number}',
            group: 'required'
        },
        {
            name: 'image-path',
            alias: 'P',
            type: String,
            description: 'NFT image path',
            typeLabel: '{underline file}',
            group: 'required'
        },
        {
            name: 'image-name',
            alias: 'N',
            type: String,
            defaultValue: '',
            description: 'NFT image name. Defaults to \'\'',
            typeLabel: '{underline string}'
        },
        {
            name: 'image-description',
            alias: 'D',
            type: String,
            defaultValue: '',
            description: 'NFT image description. Defaults to \'\'',
            typeLabel: '{underline string}'
        },
        {
            name: 'attributes',
            alias: 'A',
            type: String,
            defaultValue: '',
            description: 'NFT attributes with json format. Defaults to null',
            typeLabel: '{underline string}'
        },
    ]
    const createCollectionOptions = commandLineArgs(createCollectionOptionList, { argv })

    const createCollectionDefinitions = [
        {
            header: 'NFT Candy Machine for POAPs',
            content: 'Creates a candy machine from a collection.'
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

        init(data as CreateCandyMachineParams)
    }
}