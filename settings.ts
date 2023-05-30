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
export const overrideCollection = true
export const collectionName = "The Challenger"
export const collectionImageName = "The Challenger"
export const collectionImageDescription = "The Challenger"
export const collectionImagePath = './collection.png'

// Candy Machine settings
export const candyMachineItemsAvailable = 15

// NFT Item settings
export const itemImagePath = './nft.png'
export const itemImageName = "NFT México"
export const itemImageDescription = "Image description"
export const itemImageAttributes = [
    { "trait_type": "Some trait", "value": "Some value" }
]

// NFT Settings
export const itemName = "México Hackathon Reward"
export const nameLength = 0
export const prefixUri = "https://arweave.net/"
export const prefixUriLength = 43