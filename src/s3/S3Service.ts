import type AimsConfig from '../AimsConfig'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
  type GetObjectCommandInput,
  S3ServiceException
} from '@aws-sdk/client-s3'
import { type Readable } from 'stream'
import Papa from 'papaparse' // Import Papa Parse

interface UploadResult {
  successful: boolean
  retryable: boolean
  error: string | null
}

interface RetrieveResult {
  successful: boolean
  retryable: boolean
  warnings: string[]
  errors: string[]
}

function isRetryableError (error: any): boolean {
  if (error instanceof S3ServiceException) {
    // List of retryable error codes
    const retryableErrorCodes = [
      'InternalError',
      'InternalServerError',
      'SlowDown',
      'ServiceUnavailable',
      'Throttling',
      'RequestTimeout',
      'ProvisionedThroughputExceededException',
      'TooManyRequestsException',
      'TimeoutError'
    ]

    // Check if the error code is in the retryable list
    if (retryableErrorCodes.includes(error.name)) {
      return true
    }

    // Additionally, check for HTTP status codes
    const retryableStatusCodes = [500, 502, 503, 504, 429]
    const receivedStatusCode = error.$metadata?.httpStatusCode ?? 0
    if (retryableStatusCodes.includes(receivedStatusCode)) {
      return true
    }
  }

  // For network-related errors not specific to S3ServiceException
  if (error.name === 'NetworkingError') {
    return true
  }

  return false
}

const uploadData = async (
  config: AimsConfig,
  filename: string,
  fileData: string
): Promise<UploadResult> => {
  let s3: S3Client

  // Attempt to construct the S3 client.
  try {
    process.env.AWS_REGION = config.region
    process.env.AWS_ACCESS_KEY_ID = config.accessKey
    process.env.AWS_SECRET_ACCESS_KEY = config.secretAccessKey

    if (
      process.env.AWS_REGION == null ||
      process.env.AWS_ACCESS_KEY_ID == null ||
      process.env.AWS_SECRET_ACCESS_KEY == null
    ) {
      return {
        retryable: false,
        successful: false,
        error: 'AWS has not been configured.'
      }
    }
    // We're currently setting values into the process.env setting because the
    // configuration below is, seemingly, ignored.  Eventually, this should
    // work, but for now we're loading into the environment variables.
    s3 = new S3Client([{
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretAccessKey
      }
    }])
  } catch (error) {
    return {
      retryable: false,
      successful: false,
      error: `Cannot construct an AWS Client: ${JSON.stringify(error)}`
    }
  }

  // Attempt to send the command to AWS.
  try {
    const components = config.bucketPath.split('/')

    const bucket = components.shift()
    if (!bucket) {
      return {
        successful: false,
        retryable: false,
        error: 'Invalid bucket path'
      }
    }
    components.push('SendTo')
    components.push(filename)

    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: components.join('/'),
      Body: fileData
    }

    const response = await s3.send(new PutObjectCommand(params))

    if ((response.$metadata?.httpStatusCode ?? 0) < 300) {
      return {
        successful: true,
        retryable: false,
        error: null
      }
    }

    return {
      successful: false,
      retryable: false,
      error: JSON.stringify(response)
    }
  } catch (error: any) {
    return {
      successful: false,
      retryable: isRetryableError(error),
      error: `${error?.name ?? 'Error'}: ${error?.message ?? JSON.stringify(error)}`
    }
  }
}

const retrieveData = async (
  config: AimsConfig,
  filename: string
): Promise<RetrieveResult> => {
  let s3: S3Client

  // Initialize collections for warnings and errors
  const warnings: string[] = []
  const errors: string[] = []

  // Attempt to construct the S3 client.
  try {
    process.env.AWS_REGION = config.region
    process.env.AWS_ACCESS_KEY_ID = config.accessKey
    process.env.AWS_SECRET_ACCESS_KEY = config.secretAccessKey

    if (
      process.env.AWS_REGION == null ||
      process.env.AWS_ACCESS_KEY_ID == null ||
      process.env.AWS_SECRET_ACCESS_KEY == null
    ) {
      errors.push('AWS has not been configured')
      return {
        successful: false,
        retryable: false,
        warnings,
        errors
      }
    }

    s3 = new S3Client([{
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretAccessKey
      }
    }])
  } catch (error) {
    errors.push(`Cannot construct an AWS Client: ${JSON.stringify(error)}`)
    return {
      successful: false,
      retryable: false,
      warnings,
      errors
    }
  }

  // Attempt to get the object from AWS S3.
  try {
    const components = config.bucketPath.split('/')

    const bucket = components.shift()
    if (!bucket) {
      errors.push('Invalid bucket path.')
      return {
        successful: false,
        retryable: false,
        warnings,
        errors
      }
    }
    components.push('ReceiveFrom')
    components.push(filename)

    const params: GetObjectCommandInput = {
      Bucket: bucket,
      Key: components.join('/')
    }

    console.log(`Looking for ${filename}`)
    console.log(JSON.stringify(params))
    const response = await s3.send(new GetObjectCommand(params))

    if (!response.Body) {
      errors.push('Received empty response body.')
      return {
        successful: false,
        retryable: false,
        warnings,
        errors
      }
    }

    // Read the stream data
    const bodyContents = await streamToString(response.Body as Readable)

    // Parse CSV using Papa Parse
    const parseResult = Papa.parse<string[]>(bodyContents, {
      header: false, // Set to true if your CSV has headers
      skipEmptyLines: true
    })

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach((err) => {
        errors.push(`CSV Parsing Error: ${err.message} at row ${err.row}`)
      })
      // Depending on your use case, you might want to return here
      // return { successful: false, ... }
    }

    // Process each record
    parseResult.data.forEach((columns, index) => {
      // Ensure there are at least 4 columns
      if (columns.length < 4) return

      const thirdColumn = columns[2]
      const fourthColumn = columns[3]

      if (typeof thirdColumn !== 'string' || typeof fourthColumn !== 'string') return

      if (thirdColumn.includes('Warning')) {
        warnings.push(fourthColumn)
      } else if (thirdColumn.includes('Error')) {
        errors.push(fourthColumn)
      }
    })

    return {
      successful: true,
      retryable: false,
      warnings,
      errors
    }
  } catch (error: any) {
    // Check if the error is a NoSuchKey error
    if (error instanceof S3ServiceException && error.name === 'NoSuchKey') {
      errors.push('File not found')
      return {
        successful: false,
        retryable: false,
        warnings,
        errors
      }
    }

    errors.push(`${error?.name ?? 'Error'}: ${error?.message ?? JSON.stringify(error)}`)

    return {
      successful: false,
      retryable: isRetryableError(error),
      warnings,
      errors
    }
  }
}

// Helper function to convert stream to string
const streamToString = async (stream: Readable): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const chunks: any[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => { resolve(Buffer.concat(chunks).toString('utf-8')) })
  })
}

export { uploadData, retrieveData, type UploadResult, type RetrieveResult }
