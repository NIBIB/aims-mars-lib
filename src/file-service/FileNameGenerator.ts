/**
 * A utility class used to generate a filename for an HL7 message submission
 * to APHL AIMS.  This class is not intended to be directly used outside of
 * this library.
 */
export default class FileNameGenerator {
  labIdentifier: string
  environment: 'Test' | 'Prod'

  /**
   * Constructs a file name generator for a specific lab targeting a specific
   * environment.
   * @param labIdentifier A string value representing the lab identifier as
   * supplied to the lab by APHL.
   * @param environment The environment targeted by the filename generator.
   * Will be one of 'Test' or 'Prod'
   */
  constructor (labIdentifier: string, environment: 'Test' | 'Prod') {
    this.labIdentifier = labIdentifier
    if (!['Test', 'Prod'].includes(environment)) {
      throw new Error('Invalid environment. It should be "Test" or "Prod".')
    }
    this.environment = environment
  }

  private _getTimestamp (): string {
    const date = new Date()
    const timestamp =
      date.getUTCFullYear().toString() +
      (date.getUTCMonth() + 1).toString().padStart(2, '0') +
      date.getUTCDate().toString().padStart(2, '0') +
      date.getUTCHours().toString().padStart(2, '0') +
      date.getUTCMinutes().toString().padStart(2, '0') +
      date.getUTCSeconds().toString().padStart(2, '0') +
      date.getUTCMilliseconds().toString().padStart(3, '0')
    return timestamp
  }

  /**
   * Generates a filename compliant to the filename guidelines documented by
   * APHL AIMS.
   * @param senderOriginalFilename The original name of the file.  This can be
   * anything provided it ends with '.hl7.  It serves as a differentiator in
   * the filename generation as it is appended to the actual generated
   * filename.
   * @returns A string with a unique APHL AIMS compliant filename.
   */
  generate (senderOriginalFilename: string): string {
    let filename = senderOriginalFilename
    const fileExtension = filename.split('.').pop()

    if (fileExtension === filename) {
      filename += '.hl7'
    } else if (fileExtension !== 'hl7') {
      throw new Error('Invalid Sender Original Filename. It should end with ".hl7".')
    }

    const timestamp = this._getTimestamp()
    // eslint-disable-next-line max-len
    return `InterPartner~CentralizedELRNIHOTC~${this.labIdentifier}~AIMSPlatform~${this.environment}~${this.environment}~${timestamp}~STOP~${filename}`
  }
}
