import type AimsConfig from '../AimsConfig'
import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput
} from '@aws-sdk/client-s3'

const uploadData = async (
  config: AimsConfig,
  filename: string,
  fileData: string
): Promise<boolean> => {
  try {
    process.env.AWS_REGION = config.region
    process.env.AWS_ACCESS_KEY_ID = config.accessKey
    process.env.AWS_SECRET_ACCESS_KEY = config.secretAccessKey

    // We're currently setting values into the process.env setting because the
    // configuration below is, seemingly, ignored.  Eventually, this should
    // work, but for now we're loading into the environment variables.
    const s3: S3Client = new S3Client([{
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretAccessKey
      }
    }])

    const components = config.bucketPath.split('/')

    const bucket = components.shift()
    components.push(filename)

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
