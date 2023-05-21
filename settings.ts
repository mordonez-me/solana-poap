import { clusterApiUrl } from "@solana/web3.js"

// General settings
export const pkPath = './pk.key'
export const cluster = clusterApiUrl("devnet")
export const startDate = "2023-05-18T09:00:00Z"
export const endDate = "2023-06-21T09:00:00Z"
export const configFile = "./.config"
export const distributionListFile = "./distribution_list.txt"
export const variablePrefix = 'POAP_'

// Collection settings
export const overrideCollection = false
export const collectionName = "Solana University POAPs"
export const collectionImageName = "Solana University POAPs"
export const collectionImageDescription = "Solana University POAPs"
export const collectionImagePath = './collection.png'

// Candy Machine settings
export const candyMachineItemsAvailable = 2

// NFT Item settings
export const itemImagePath = './caro.jpeg'
export const itemImageName = "Community Call #1"
export const itemImageDescription = "Description for Community Call"
export const itemImageAttributes = [
    { "trait_type": "Location", "value": "Twitter" }
]

// NFT Settings
export const itemName = "Community Call"
export const nameLength = 0
export const prefixUri = "https://arweave.net/"
export const prefixUriLength = 43