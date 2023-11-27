// import {
//   MARSClient,
//   MARSHubProvider,
//   LabInfo,
//   LabTestSubject,
//   LabTestInfo,
//   LabTestObservation
// } from 'radx-mars-lib';
// import AIMSHubProvider from './AIMSHubProvider';
// // Instantiate the required arguments

// const provider = new AIMSHubProvider(/* provider specific arguments here */);
// const config = new LabInfo('LabCorp', '1234');

// // Then create a new MARSClient
// const client = new MARSClient(provider, config);
// const resultSubmitter =
//   client.createResultSubmitter(new LabTestInfo('', ''));
// resultSubmitter.submitResult(
//     new LabTestSubject(
//         'patientId',
//         'patientName',
//         'patientAddress',
//         'patientBirthdate',
//         'patientSex'),
//     new LabTestObservation(
//         'observationIdentifier',
//         'observationValue',
//         'observationResultStatus'
//     ));

import AimsHubProvider from './AimsHubProvider'
import type AimsConfig from './AimsConfig'

export { AimsHubProvider, type AimsConfig }
