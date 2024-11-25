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
   * Generates a unique identifier similar to nano-id.
   * This function is lightweight and suitable for environments where
   * performance and size are critical.
   *
   * @param length - The desired length of the generated ID. Defaults to 21.
   * @returns A unique identifier string.
   */
  private _generateNanoId (length: number = 21): string {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const charactersLength = characters.length
    let result = ''

    // Use an array to build the ID for better performance
    const resultArray = new Array(length)
    for (let i = 0; i < length; i++) {
      // Math.random() generates a number in the range of [0, 1)
      const randomIndex = Math.floor(Math.random() * charactersLength)
      resultArray[i] = characters[randomIndex]
    }

    // Join the array into a string
    result = resultArray.join('')
    return result
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
  submission (): { filename: string, timestamp: string, uniquer: string } {
    const uniquer = this._generateNanoId(21)
    const timestamp = this._getTimestamp()
    return {
      // eslint-disable-next-line max-len
      filename: `InterPartner~CentralizedELRNIHOTC~${this.labIdentifier}~AIMSPlatform~${this.environment}~${this.environment}~${timestamp}~STOP~${uniquer}.hl7`,
      uniquer,
      timestamp
    }
  }

  retrieval (timestamp: string, uniquer: string): string {
    // eslint-disable-next-line max-len
    return `InterPartner~NIHOTCWarningandErrorReport~AIMSPlatform~${this.labIdentifier}~${this.environment}~${this.environment}~${timestamp}~STOP~${uniquer}.csv`
  }
}
