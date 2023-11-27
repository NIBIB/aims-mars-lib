import { type MarsHubProvider, IsoHierarchicDesignator } from 'radx-mars-lib'
import { uploadData } from './s3/S3Service'
import FileNameGenerator from './file-service/FileNameGenerator'
import type AimsConfig from './AimsConfig'

export default class AimsHubProvider implements MarsHubProvider {
  private readonly _useProduction: boolean = false
  private readonly _fileNameGenerator: FileNameGenerator
  private readonly _aimsConfig: AimsConfig
  private readonly _receivingApplicationStage: IsoHierarchicDesignator =
    new IsoHierarchicDesignator('AIMS.INTEGRATION.STG', '2.16.840.1.114222.4.3.15.2')

  private readonly _receivingApplicationProd: IsoHierarchicDesignator =
    new IsoHierarchicDesignator('AIMS.INTEGRATION.PRD', '2.16.840.1.114222.4.3.15.1')

  private readonly _receivingFacility: IsoHierarchicDesignator =
    new IsoHierarchicDesignator('AIMS.PLATFORM', '2.16.840.1.114222.4.1.217446')

  constructor (
    labIdentifier: string,
    aimsConfig: AimsConfig,
    useProduction: boolean = false
  ) {
    this._useProduction = useProduction
    // So, thanks, Amazon:
    // https://github.com/aws/aws-sdk-js-v3/issues/1466
    if (aimsConfig.region) process.env.AWS_REGION = aimsConfig.region
    if (aimsConfig.accessKey) process.env.AWS_ACCESS_KEY_ID = aimsConfig.accessKey
    if (aimsConfig.secretAccessKey) process.env.AWS_SECRET_ACCESS_KEY = aimsConfig.secretAccessKey

    // Now we need to reverse the region so we pass it through from either the
    // envirionment variables OR the values we just set.  We're doing this so
    // we can safely remove the other above code when AWS fixes their issues

    this._aimsConfig = {
      bucketPath: aimsConfig.bucketPath,
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }

    console.log(aimsConfig)
    console.log(this._aimsConfig)

    this._fileNameGenerator =
      new FileNameGenerator(labIdentifier, useProduction ? 'Prod' : 'Test')
  }

  get receivingApplicationIdentifier (): IsoHierarchicDesignator {
    if (this._useProduction) {
      return this._receivingApplicationProd
    }

    return this._receivingApplicationStage
  }

  get receivingFacilityIdentifier (): IsoHierarchicDesignator {
    return this._receivingFacility
  }

  get isUsingProduction (): boolean {
    return this._useProduction
  }

  async submitTest (hl7Message: string): Promise<boolean> {
    // FileServiceFactory.createFileService().then(fs => {
    //     fs.readFile('')
    // })
    // console.log(hl7Message)
    const filename = this._fileNameGenerator.generate('random-digits')
    try {
      await uploadData(this._aimsConfig, filename, hl7Message)

      return true
    } catch (_) {
      return false
    }
  }
}
