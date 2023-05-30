import _, { Dictionary } from 'lodash'
import * as fs from 'fs'
import * as path from 'path'
import { clusterApiUrl } from '@solana/web3.js'

// const fs = require('fs')
// const path = require('path')

export const checkFileExistence = (filePath: string) => {
    const file = path.resolve(process.cwd(), filePath)
    return fs.existsSync(file)
}

export const validateFilesExistenceFromKeys = (keys: string[], data: object) => {
    const filePaths = _.values(_.pick(data, keys));
    const filesExistResult = _.map(filePaths, x => {
        const exist = checkFileExistence(x)
        if (!exist) {
            return `File ${x} doesn't exist`
        } else {
            return true
        }
    })
    return _.filter(filesExistResult, x => typeof x == 'string')
}

export const checkRequiredKeys = (optionList: object, requiredOptionList: object) => {
    const requiredKeys = _.map(_.filter(optionList, x => _.get(x, 'defaultValue') == undefined), 'name')
    const passedKeys = _.keys(requiredOptionList)
    return _.intersection(requiredKeys, passedKeys).length == requiredKeys.length
}

export const convertOptionsToCamelCase = (options: object): Dictionary<any> => {
    return _.mapKeys(options, function (value, key) {
        return _.camelCase(key);
    });
}

export const privateKeyCommandLine = {
    name: 'private-key',
    alias: 'k',
    type: String,
    description: 'Path to a private key',
    typeLabel: '{underline file}',
    group: 'required'
}

const cluster = clusterApiUrl("devnet")
export const clusterCommandLine = {
    name: 'cluster',
    alias: 'c',
    type: String,
    defaultValue: cluster,
    description: 'Cluster to be used.\n{italic Defaults to devnet.}\n',
    typeLabel: '{underline url}'
}