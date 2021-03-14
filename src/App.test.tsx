import '@testing-library/jest-dom'
import * as React from 'react'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import App from './App'

const mockSourceResponse = [{language :"DE",name:"German"},{language:"EN",name:"English"},{language:"ES",name:"Spanish"}];
const mockTargetResponse = [{language:"DE",name:"German"},{language:"EN-GB",name:"English (British)"},{language:"EN-US",name:"English (American)"},{language:"ES",name:"Spanish"}];
const mockTranslationResponse = {translations:[{detected_source_language: "DE", text: "Hello world"}]}
const server = setupServer(
  rest.get('https://api.deepl.com/v2/languages', (req, res, ctx) => {
    const type = req.url.searchParams.get('type');
    if (type === 'source') {
      return res(ctx.json(mockSourceResponse));
    } else if (type === 'target') {
      return res(ctx.json(mockTargetResponse));
    }
    return res(ctx.json([]));
  }),
  rest.post('https://api.deepl.com/v2/translate', (req, res,ctx) => {
    return res(ctx.json(mockTranslationResponse));
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

const mockApiKey = '111111111111111111111111111111111111';

test('Translation form is initially disabled', () => {
  render(<App />)
  
  expect(getSourceTextarea()).toHaveAttribute('disabled');
});

test('User enters api key and enters translation query', async () => {
  render(<App />)
  submitApiKey(mockApiKey);
  await waitFor(() => screen.getByDisplayValue(mockSourceResponse[0].name))
  enterTextToTranslate('Hallo Welt');
  await waitFor(() => expect(screen.getByText(mockTranslationResponse.translations[0].text)).toBeInTheDocument())
});

function getSourceTextarea() {
  return screen.getByPlaceholderText('Enter or paste text to translate');
}

function enterTextToTranslate(query: string) {
  const queryTextarea = screen.getByPlaceholderText('Enter or paste text to translate');
  fireEvent.input(queryTextarea, { target: { value: query } });
}

function submitApiKey(apiKey: string) {
  const apiKeyInput = screen.getByLabelText('Enter your API key:');
  fireEvent.input(apiKeyInput, { target: { value: apiKey } })
  fireEvent(
    screen.getByText('Save'),
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
  )
}
