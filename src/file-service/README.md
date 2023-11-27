
Filename Components
InterPartner~<UC>~< SJ>~< RJ>~<SE>~<RE>~<Timestamp>~STOP~<SOF>
 The filename should always start with “InterPartner”
 The Use Case should always be “CentralizedELRNIHOTC”
 The Sending Jurisdiction (SJ) should be “LabIdentifier” (this is assigned to the labs by AIMS)
 The Receiving Jurisdiction (RJ) should always be AIMSPlatform (AIMS routes to individual states)
 The Sending Environment (SE) should be Test (case sensitive)
 The Receiving Environment (RE) should be Test (case sensitive)
• Example of Correct Filename for Staging/Test messages:
– InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Test~Test~20210122075541000~STOP~HelloWorld.hl7
• Example of Correct Filename for Production messages:
– InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Prod~Prod~20210122075541000~STOP~HelloWorld.hl7
• Notes:
– TimeStamp should be in yyyyMMddHHmmssSSS format
– SOF (Sender Original Filename) should end in “.hl7”
– Sending Environment and Receiving Environment change from “Test~Test” to “Prod~Prod” when lab is ready to send to Production
– Each Field should be separated by tildes “~”