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
 */
interface AimsConfig {
  region?: string
  accessKey?: string
  secretAccessKey?: string
  bucketPath: string
}

export default AimsConfig
