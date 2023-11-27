// FileServiceFactory.ts
import type FileService from './FileService'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class FileServiceFactory {
  static async createFileService (platform?: 'server' | 'mobile' | 'web'): Promise<FileService> {
    let FileServiceImplementation

    if (!platform) {
      if (typeof document !== 'undefined') {
        // I'm on the web!
        platform = 'web'
      } else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        // I'm in react-native
        platform = 'mobile'
      } else {
        // I'm in node js
        platform = 'server'
      }
    }
    if (platform === 'server') {
      FileServiceImplementation = (await import('./impl/NodeFileService')).default
    } else if (platform === 'mobile') {
      FileServiceImplementation = (await import('./impl/ReactNativeFileService')).default
    }

    console.log('Platform')

    if (!FileServiceImplementation) {
      throw new Error(`Invalid platform or platform not currently supported: ${platform}`)
    }

    return new FileServiceImplementation()
  }
}
