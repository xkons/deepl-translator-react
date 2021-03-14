import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from './use-debounce';
import TranslateForm, { LanguageOptions } from './components/TranslateForm';
import ApiKeyForm, { API_KEY_LOCAL_STORAGE_KEY } from './components/ApiKeyForm';

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
    if (query && query.length > 0) {
      translate(apiKey, query, newLanguages).then(translation => {
        setTranslation(translation)
      })
    }
    
  }
  const onInput = (text: string) => setQuery(text);

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

  const translateFormProps = {
    activeLanguages,
    languageOptions,
    query,
    translation,
    disabled: !isApiKeyValid,
    onLanguagesChange,
    onInput
  };
  const apiKeyFormProps = { apiKey, setApiKey, isApiKeyValid, setIsApiKeyValid, setLanguageOptions };

  return (
    <div className="text-center">
      <main>
        <ApiKeyForm {...apiKeyFormProps}/>
        <div className="mt-4">
          <TranslateForm {...translateFormProps}></TranslateForm>
        </div>
        {isRequestPending && <p>Translating ...</p>}
      </main>
    </div>
  );
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

export default App;
