import { clusterApiUrl } from "@solana/web3.js"

export const pkPath = './pk.key'
export const imagePath = './space.png'
export const cluster = clusterApiUrl("devnet")
export const collectionSize = 3
export const startDate = "2023-01-20T09:00:00Z"
export const endDate = "2023-01-21T09:00:00Z"
export const configFile = "./.config"
export const distributionListFile = "./distribution_list.txt"
export const collectionName = "Solana University Space POAP"
export const imageName = "Solana University Space Image"
export const imageDescription = "Solana University Space Image"
export const imageAttributes = [
    { "trait_type": "Location", "value": "Twitter Space" }
]
export const itemName = "Solana University POAP #$ID+1$" // Use prefix to save space
export const nameLength = 0 // 0 because the use of prefix
export const prefixUri = "https://arweave.net/"
export const prefixUriLength = 43 // This is for arweave