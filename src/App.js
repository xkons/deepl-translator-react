import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from './use-debounce';
import './App.css';
import TranslateForm from './components/TranslateForm';

function App() {
  const initialLanguages = {
    source: { label: 'German', code: 'DE' },
    target: { label: 'English (American)', code: 'EN-US' }
  }
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState(initialLanguages);
  const [languageOptions, setLanguageOptions] = useState({ source: [], target: []});
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const onLanguagesChange = (newLanguages) => setActiveLanguages(newLanguages);
  const onApiKeyChange = (value) => setApiKey(value);
  const onInput = (text) => setQuery(text);

  const onSubmitApiKey = useCallback(async () => {
    if (!validateApiKey(apiKey)) return
    try {
      const [sourceLanguages, targetLanguages] = await getSupportedLanguages(apiKey);
      setLanguageOptions({ source: sourceLanguages, target: targetLanguages });
      setIsApiKeyValid(true);
    } catch (error) {
      console.error(error);
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

  const translateFormProps = { activeLanguages, languageOptions, query, translation, disabled: !isApiKeyValid, onLanguagesChange, onInput };
  return (
    <div className="App">
      <main>
        <label for="api-key">Enter your API key:</label>
        <input id="api-key" type="text" onChange={onApiKeyChange}></input>
        <button onClick={onSubmitApiKey}>Submit</button>
        <TranslateForm {...translateFormProps}></TranslateForm>
        {isRequestPending && <div>Translating ...</div>}
      </main>
    </div>
  );
}

function validateApiKey(apiKey) {
  return !!apiKey && apiKey.length > 3; // TODO: implement real world rules
}

function translate(apiKey, text, languages) {
  const params = new URLSearchParams({
    'auth_key': `[${apiKey}]`,
    'source_lang': languages.source.code,
    'target_lang': languages.target.code,
    'text': text
  });

  return fetch('https://api.deepl.com/v2/translate', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(r => r.json())
    .then(response => response.translations.map((translation) => translation.text).join(' '))
    .catch(error => {
      console.error(error);
      return 'Could not translate';
    });
}

function getSupportedLanguages(apiKey) {
  return Promise.all([
    fetch(`https://api.deepl.com/v2/languages?auth_key=[${apiKey}]&type=source`),
    fetch(`https://api.deepl.com/v2/languages?auth_key=[${apiKey}]&type=target`)
  ]).then(([sourceResponse, targetResponse]) => [sourceResponse.json(), targetResponse.json()])
}

export default App;
