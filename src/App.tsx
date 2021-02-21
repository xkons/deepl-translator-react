import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from './use-debounce';
import TranslateForm, { LanguageOptions } from './components/TranslateForm';

export interface DeeplLanguage {
  /**
   * e.g. ES, DE, FR
   */
  language: string;
  name: string;
}

const API_KEY_LOCAL_STORAGE_KEY = 'deepl_apikey';

function App() {
  const initialLanguages: { source: DeeplLanguage, target: DeeplLanguage } = {
    source: { name: 'German', language: 'DE' },
    target: { name: 'English (American)', language: 'EN-GB' }
  }
  const apiKeyFromLocalStorage = localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY)
  const [apiKey, setApiKey] = useState(apiKeyFromLocalStorage ?? '');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState(initialLanguages);
  const [languageOptions, setLanguageOptions] = useState<LanguageOptions>({ source: [], target: []});
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const onLanguagesChange = (newLanguages: { source: DeeplLanguage, target: DeeplLanguage }) => {
    // the region specific versions of a language are only supported as target, not as source
    if (['EN-GB', 'EN-US'].includes(newLanguages.source.language)) {
      newLanguages.source.language = 'EN'; 
      newLanguages.source.name = 'English';
    } else if (['PT-PT', 'PT-BR'].includes(newLanguages.source.language)) {
      newLanguages.source.language = 'PT';
      newLanguages.source.name = 'Portuguese';
    }

    if (newLanguages.target.language === 'EN') {
      newLanguages.target.language = 'EN-GB';
      newLanguages.target.name = 'English (British)';
    } else if (newLanguages.target.language === 'PT') {
      newLanguages.target.language = 'PT-PT';
      newLanguages.target.language = 'Portuguese (European)';
    }

    setActiveLanguages(newLanguages);
    translate(apiKey, query, newLanguages).then(translation => {
      setTranslation(translation)
    })
  }
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
      localStorage.setItem(API_KEY_LOCAL_STORAGE_KEY, apiKey);
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
    <form className="mt-4 px-6 flex flex-col sm:flex-row sm:flex-nowrap justify-center place-items-center" onSubmit={onSubmitApiKey}>
      <label htmlFor="api_key" className="mr-2 mb-2 text-center sm:mb-0">Enter your API key:</label>
      <input className="border w-5/6 sm:w-80 py-1 px-2 text-sm text-gray-900 rounded-lg" id="api_key" name="api_key" type="text" value={apiKey} onChange={onApiKeyChange} required></input>
      <input type="submit" value="Save" className="btn mt-2 mx-2  sm:mt-0"></input>
    </form>
  )

  const translateFormProps = { activeLanguages, languageOptions, query, translation, disabled: !isApiKeyValid, onLanguagesChange, onInput };
  return (
    <div className="text-center">
      <main>
        {isApiKeyValid ? <p className="mt-4">Using API key {apiKey.substr(0,3)}...<button className="btn ml-2" onClick={onEditApiKey}>Edit</button></p> : apiKeyForm}
        <div className="mt-4">
          <TranslateForm {...translateFormProps}></TranslateForm>
        </div>
        {isRequestPending && <p>Translating ...</p>}
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
  //return Promise.resolve('Hello ' + text);

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
