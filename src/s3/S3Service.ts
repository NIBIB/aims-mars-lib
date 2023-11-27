import type AimsConfig from '../AimsConfig'
import FileServiceFactory from '../file-service/FileServiceFactory'
import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput
} from '@aws-sdk/client-s3'

const uploadData = async (
  config: AimsConfig,
  filename: string,
  data: string,
  isFilePath = false
): Promise<boolean> => {
  try {
    console.log(config)
    process.env.AWS_REGION = config.region
    process.env.AWS_ACCESS_KEY_ID = config.accessKey
    process.env.AWS_SECRET_ACCESS_KEY = config.secretAccessKey

    console.log(process.env)
    // Eventually, this should work.  But thanks to AWS, it doesn't work today.
    const s3: S3Client = new S3Client([{
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretAccessKey
      }
    }])

    let fileData: string
    if (isFilePath) {
      const fileService = await FileServiceFactory.createFileService()
      fileData = await fileService.readFile(data)
    } else {
      fileData = data
    }

    const components = config.bucketPath.split('/')

    const bucket = components.shift()
    components.push(filename)
    console.log(bucket)
    console.log(components.join('/'))
    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: components.join('/'),
      Body: fileData
    }

    const response = await s3.send(new PutObjectCommand(params))
    return response != null
  } catch (error) {
    console.error(error)
    return false
  }
}

export { uploadData }
