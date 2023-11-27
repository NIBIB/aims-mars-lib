// ReactNativeFileService.js

import FileService from '../FileService'
import RNFetchBlob from 'react-native-fetch-blob'

export default class ReactNativeFileService extends FileService {
  async readFile (path: string): Promise<string> {
    return await RNFetchBlob.fs.readFile(path, 'base64')
  }
}
