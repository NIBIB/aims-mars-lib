/**
 * An interface with no concrete implementation designed to encapsulate the
 * AIMS configuration as supplied to the laboratory by APHL.
 *
 * Note, the region, accessKey, and secretAccessKey are raw AWS values provided
 * to the laboratory by APHL.  They are passed directly to the underlying AWS
 * libraries used by this API.  If these values are not provided as part of the
 * config, the AIMS API will attempt to locate them in the same environment
 * variables used by the AWS API and, if found, will use them when other values
 * are not provided.
 *
 * The following properties are represented in this interface
 *
 * @param region The AWS region, such as us-east-1a
 * @param accessKey The AWS access key provided to you by AIMS
 * @param secretAccessKey The AWS secret access key provided to you by AIMS
 * @param bucketPath The bucket path provided to you by AIMS
 */

interface AimsConfig {
  /** The AWS region, such as us-east-1a */
  region?: string
  /** The AWS access key provided to you by AIMS */
  accessKey?: string
  /** The AWS secret access key provided to you by AIMS */
  secretAccessKey?: string
  /** The bucket path provided to you by AIMS */
  bucketPath: string
}

export default AimsConfig
