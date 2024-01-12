import { type MarsHubProvider, IsoHierarchicDesignator } from 'radx-mars-lib'
import { uploadData } from './s3/S3Service'
import FileNameGenerator from './file-service/FileNameGenerator'
import type AimsConfig from './AimsConfig'

/**
 * The AimsHubProvider is a {@link MarsHubProvider} implementation capable of
 * delivering HL7 messages to the APHL AIMS MARS compliant hub for routing
 * of HL7 ELR 2.5.1 messages to health departments as part of fulfilling
 * obligations of participation in the RADx program.
 */
export default class AimsHubProvider implements MarsHubProvider {
  private readonly _useProduction: boolean = false
  private readonly _fileNameGenerator: FileNameGenerator
  private readonly _aimsConfig: AimsConfig

  private readonly _receivingApplicationStage: IsoHierarchicDesignator =
    new IsoHierarchicDesignator(
      'AIMS.INTEGRATION.STG',
      '2.16.840.1.114222.4.3.15.2'
    )

  private readonly _receivingApplicationProd: IsoHierarchicDesignator =
    new IsoHierarchicDesignator(
      'AIMS.INTEGRATION.PRD',
      '2.16.840.1.114222.4.3.15.1'
    )

  private readonly _receivingFacility: IsoHierarchicDesignator =
    new IsoHierarchicDesignator(
      'AIMS.PLATFORM',
      '2.16.840.1.114222.4.1.217446'
    )

  /**
   * Constructs an {@link AimsHubProvider} with configuration specific to a
   * laboratory's configuration as supplied by APHL.
   *
   * @param labIdentifier this is the lab identifier provided to the laboratory
   * as part of the onboarding process to APHL.
   * @param aimsConfig An {@link AimsConfig} object containing all of the
   * information for communicating with AIMS as provided to the laboratory by
   * APHL.
   * @param useProduction an optional boolean flag indicating whether or not
   * the provider is to communicate with the production or staging
   * environments. If not provided, a value of false is assumed and the
   * provider will communicate with the staging environment.
   */
  constructor (
    labIdentifier: string,
    aimsConfig: AimsConfig,
    useProduction: boolean = false
  ) {
    this._useProduction = useProduction
    // So, thanks, Amazon:
    // https://github.com/aws/aws-sdk-js-v3/issues/1466
    // This is allegedly fixed but continues to occur in our testing.  We will
    // monitor this bug and issue a fix once we can guarantee it doesn't break.
    // In the interim, this code works to address the issue such that fixing
    // it doesn't not induce breaking changes.
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

  /**
   * Overrides the base {@link MarsHubProvider}'s submitTest message.  This
   * method handles the actual delivery of the HL7 message (provided to it as
   * a string argument) to AIMS.
   *
   * @param hl7Message the message to send.
   * @returns a boolean value indicating successful delivery.
   */
  async submitTest (hl7Message: string): Promise<boolean> {
    const filename = this._fileNameGenerator.generate('random-digits')
    try {
      await uploadData(this._aimsConfig, filename, hl7Message)

      return true
    } catch (_) {
      return false
    }
  }
}
