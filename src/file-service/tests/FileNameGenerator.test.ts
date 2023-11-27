import FileNameGenerator from '../FileNameGenerator'

test('FileNameGenerator generates correct filename for Test environment', () => {
  const generator = new FileNameGenerator('RECURO', 'Test')
  let filename = generator.generate('HelloWorld')
  expect(filename)
    .toMatch(/^InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Test~Test~\d{17}~STOP~HelloWorld.hl7$/)

  filename = generator.generate('HelloWorld.hl7')
  expect(filename)
    .toMatch(/^InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Test~Test~\d{17}~STOP~HelloWorld.hl7$/)
})

test('FileNameGenerator generates correct filename for Prod environment', () => {
  const generator = new FileNameGenerator('RECURO', 'Prod')
  let filename = generator.generate('HelloWorld')
  expect(filename)
    .toMatch(/^InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Prod~Prod~\d{17}~STOP~HelloWorld.hl7$/)

  filename = generator.generate('HelloWorld.hl7')
  expect(filename)
    .toMatch(/^InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Prod~Prod~\d{17}~STOP~HelloWorld.hl7$/)
})

test('FileNameGenerator throws error for invalid sender original filename', () => {
  const generator = new FileNameGenerator('RECURO', 'Test')
  expect(() => generator.generate('InvalidFileName.txt')).toThrow(Error)
})
