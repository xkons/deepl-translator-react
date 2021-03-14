import React from "react";
import { useCallback } from "react";
import { DeeplLanguage } from "../App";


function validateApiKey(apiKey: string) {
    return !!apiKey && apiKey.length === 36;
}

export type ApiKeyFormProps = {
    apiKey: string,
    setApiKey: (apiKey: string) => void,
    isApiKeyValid: boolean,
    setIsApiKeyValid: (value: boolean) => void,
    setLanguageOptions: (languageOptions: { source: DeeplLanguage[], target: DeeplLanguage[] }) => void,
    
}

export const API_KEY_LOCAL_STORAGE_KEY = 'deepl_apikey';

const ApiKeyForm = ({ apiKey, setApiKey, isApiKeyValid, setIsApiKeyValid, setLanguageOptions }: ApiKeyFormProps) => {
    const onApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => setApiKey(event.target.value);
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

    const onEditApiKey = () => setIsApiKeyValid(false);
    
    const form = (
        <form className="mt-4 px-6 flex flex-col sm:flex-row sm:flex-nowrap justify-center place-items-center" onSubmit={onSubmitApiKey}>
            <label htmlFor="api_key" className="mr-2 mb-2 text-center sm:mb-0">Enter your API key:</label>
            <input className="border w-5/6 sm:w-80 py-1 px-2 text-sm text-gray-900 rounded-lg" id="api_key" name="api_key" type="text" value={apiKey} onChange={onApiKeyChange} required></input>
            <input type="submit" value="Save" className="btn mt-2 mx-2  sm:mt-0"></input>
        </form>
    )
    return (
        <React.Fragment>
            {isApiKeyValid ? <p className="mt-4">Using API key {apiKey.substr(0,3)}...<button className="btn ml-2" onClick={onEditApiKey}>Edit</button></p> : form}
        </React.Fragment>
    );
};

async function getSupportedLanguages(apiKey: string): Promise<[DeeplLanguage[], DeeplLanguage[]]> {
    const [sourceLanguagesResponse, targetLanguagesResponse] = await Promise.all([
      fetch(`https://api.deepl.com/v2/languages?auth_key=${apiKey}&type=source`),
      fetch(`https://api.deepl.com/v2/languages?auth_key=${apiKey}&type=target`)
    ]);
    const sourceLanguages: DeeplLanguage[] = await sourceLanguagesResponse.json();
    const targetLanguages: DeeplLanguage[] = await targetLanguagesResponse.json();
    return [sourceLanguages, targetLanguages];
  }

export default ApiKeyForm;