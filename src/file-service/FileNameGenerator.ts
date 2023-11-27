export default class FileNameGenerator {
  labIdentifier: string
  environment: 'Test' | 'Prod'

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
