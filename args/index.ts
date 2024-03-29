import { clusterApiUrl } from "@solana/web3.js"
import commandLineUsage from 'command-line-usage'
import commandLineArgs from 'command-line-args'
import runCreateCollection from './create'
import runCreateCandyMachine from './candy-machine'
import runUpdateCandyMachine from './update-candy-machine'
import runAirdrop from './airdrop'
import _ from 'lodash'

const commands = [
    {
        name: 'command', defaultOption: true,
        description: 'create-collection | create-candy-machine | airdrop'
    },
]

const mainDefinitions = [
    {
        header: 'NFT Collection for POAPs',
        content: 'Creates a collection, candy machine and airdrop NFTs.'
    },
    {
        header: 'Synopsis',
        content: [
            '$ create-collection --args',
            '$ create-candy-machine --args',
            '$ airdrop --args'
        ]
    },
    {
        header: 'Options',
        optionList: commands
    }
]

const mainOptions = commandLineArgs(commands, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || []

const CREATE_COLLECTION = 'create-collection'
const CREATE_CANDY_MACHINE = 'create-candy-machine'
const UPDATE_CANDY_MACHINE = 'update-candy-machine'
const AIRDROP = 'airdrop'

const allowedCommands = [CREATE_CANDY_MACHINE, UPDATE_CANDY_MACHINE, CREATE_COLLECTION, AIRDROP]

const commandDetected = _.filter(_.map(
    allowedCommands, command => mainOptions.command == command
), x => x == false)

if (commandDetected.length == allowedCommands.length) {
    const mainUsage = commandLineUsage(mainDefinitions)
    console.log(mainUsage)
}

if (mainOptions.command === CREATE_COLLECTION) {
    runCreateCollection(argv)
} else if (mainOptions.command === CREATE_CANDY_MACHINE) {
    runCreateCandyMachine(argv)
} else if (mainOptions.command === UPDATE_CANDY_MACHINE) {
    runUpdateCandyMachine(argv)
} else if (mainOptions.command === AIRDROP) {
    runAirdrop(argv)
}
