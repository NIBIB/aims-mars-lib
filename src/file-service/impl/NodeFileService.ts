// NodeFileService.js

import { promises as fs } from 'fs'
import FileService from '../FileService.js'

export default class NodeFileService extends FileService {
  async readFile (path: string): Promise<string> {
    return await fs.readFile(path, 'utf-8')
  }
}
