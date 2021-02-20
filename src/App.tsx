import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from './use-debounce';
import './App.css';
import TranslateForm, { LanguageOptions } from './components/TranslateForm';

export interface DeeplLanguage {
  /**
   * e.g. ES, DE, FR
   */
  language: string;
  name: string;
}

function App() {
  const initialLanguages: { source: DeeplLanguage, target: DeeplLanguage } = {
    source: { name: 'German', language: 'DE' },
    target: { name: 'English (American)', language: 'EN-US' }
  }
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState(initialLanguages);
  const [languageOptions, setLanguageOptions] = useState<LanguageOptions>({ source: [], target: []});
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const onLanguagesChange = (newLanguages: { source: DeeplLanguage, target: DeeplLanguage }) => setActiveLanguages(newLanguages);
  const onApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => setApiKey(event.target.value);
  const onInput = (text: string) => setQuery(text);

  const onEditApiKey = () => setIsApiKeyValid(false);

  const onSubmitApiKey = useCallback(async (event) => {
    event.preventDefault();
    if (!validateApiKey(apiKey)) {
      return setApiKey('Needs to be 36 characters');
    }
    try {
      const [sourceLanguages, targetLanguages] = await getSupportedLanguages(apiKey);
      setLanguageOptions({ source: sourceLanguages, target: targetLanguages });
      setIsApiKeyValid(true);
    } catch (error) {
      console.error(error);
      setApiKey('Invalid API key');
      setIsApiKeyValid(false);
    }
  }, [apiKey]);

  useEffect(
    () => {
      if (debouncedQuery) {
        setIsRequestPending(true);
        translate(apiKey, debouncedQuery, activeLanguages).then(translation => {
          setIsRequestPending(false);
          setTranslation(translation)
        })
      } else {
        setTranslation('');
      }
    },
    [debouncedQuery]
  );

  const apiKeyForm = (
    <form onSubmit={onSubmitApiKey}>
      <label htmlFor="api-key">Enter your API key:</label>
      <input id="api-key" type="text" value={apiKey} onChange={onApiKeyChange} required></input>
      <input type="submit" value="Save"></input>
    </form>
  )

  const translateFormProps = { activeLanguages, languageOptions, query, translation, disabled: !isApiKeyValid, onLanguagesChange, onInput };
  return (
    <div className="App">
      <main>
        {isApiKeyValid ? <p>Using API key {apiKey.substr(0,3)}...<button onClick={onEditApiKey}>Edit</button></p> : apiKeyForm}
        <TranslateForm {...translateFormProps}></TranslateForm>
        {isRequestPending && <div>Translating ...</div>}
      </main>
    </div>
  );
}

function validateApiKey(apiKey: string) {
  return !!apiKey && apiKey.length === 36;
}

function translate(apiKey: string, text: string, languages: { source: DeeplLanguage, target: DeeplLanguage }) {
  const params = new URLSearchParams({
    'auth_key': apiKey,
    'source_lang': languages.source.language,
    'target_lang': languages.target.language,
    'text': text
  });

  return fetch('https://api.deepl.com/v2/translate', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(r => r.json())
    .then((response: { translations: { detected_source_language: string; text: string;}[]}) => response.translations.map((translation) => translation.text).join(' '))
    .catch(error => {
      console.error(error);
      return 'Could not translate';
    });
}

async function getSupportedLanguages(apiKey: string): Promise<[DeeplLanguage[], DeeplLanguage[]]> {
  const [sourceLanguagesResponse, targetLanguagesResponse] = await Promise.all([
    fetch(`https://api.deepl.com/v2/languages?auth_key=${apiKey}&type=source`),
    fetch(`https://api.deepl.com/v2/languages?auth_key=${apiKey}&type=target`)
  ]);
  const sourceLanguages: DeeplLanguage[] = await sourceLanguagesResponse.json();
  const targetLanguages: DeeplLanguage[] = await targetLanguagesResponse.json();
  return [sourceLanguages, targetLanguages];
}

export default App;
