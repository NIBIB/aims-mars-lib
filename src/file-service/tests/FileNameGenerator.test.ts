import FileNameGenerator from '../FileNameGenerator'

test('FileNameGenerator generates correct filename for Test environment', () => {
  const generator = new FileNameGenerator('RECURO', 'Test')
  const filename = generator.submission()
  expect(filename.filename)
    .toMatch(/^InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Test~Test~\d{17}~STOP~[A-Za-z0-9]{21}.hl7$/)
})

test('FileNameGenerator generates correct filename for Prod environment', () => {
  const generator = new FileNameGenerator('RECURO', 'Prod')
  const filename = generator.submission()
  expect(filename.filename)
    .toMatch(/^InterPartner~CentralizedELRNIHOTC~RECURO~AIMSPlatform~Prod~Prod~\d{17}~STOP~[A-Za-z0-9]{21}.hl7$/)
})
