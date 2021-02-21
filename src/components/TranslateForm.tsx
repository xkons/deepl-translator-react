import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { DeeplLanguage } from '../App';
import './TranslateForm.css';

export type TranslateFormProps = {
    query: string;
    translation: string;
    activeLanguages: { source: DeeplLanguage, target: DeeplLanguage };
    languageOptions: LanguageOptions;
    onLanguagesChange: Function;
    onInput: Function;
    disabled: boolean;
}

export type LanguageOptions = {
    source: DeeplLanguage[];
    target: DeeplLanguage[];
}

const TranslateForm = ({ query, translation, activeLanguages, languageOptions, disabled, onLanguagesChange, onInput }: TranslateFormProps) => {
    const outputTextareaValue = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onInput(event.target.value);
    }
    const [textAreaHeight, setTextAreaHeight] = useState(5)

    const reverseDirection = () => {
        onLanguagesChange({ source: activeLanguages.target, target: activeLanguages.source });
        onInput(translation);
    }
    const onHeightChange = (height: number) => setTextAreaHeight(height);
    const onSourceLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const language = event.target.value;
        if (language === activeLanguages.source.language) {
            return;
        }
        const newSourceLanguage = languageOptions.source.find((langOpt) => langOpt.language === language);
        onLanguagesChange({ source: newSourceLanguage, target: activeLanguages.target });
    }
    const onTargetLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const language = event.target.value;
        if (language === activeLanguages.target.language) {
            return;
        }
        const newTargetLanguage = languageOptions.target.find((langOpt) => langOpt.language === language);
        onLanguagesChange({ source: activeLanguages.source, target: newTargetLanguage });
    }

    const targetTextAreaStyle = {
        height: textAreaHeight
    };

    const sourceOptions = languageOptions.source.map((language) => (<option key={'source-' + language.language} value={language.language}>{language.name}</option>))
    const targetOptions = languageOptions.target.map((language) => (<option key={'target-' + language.language} value={language.language}>{language.name}</option>))

    return (
        <div className="container mx-auto px-4 w-full">
            <div className="flex flex-row justify-center flex-nowrap mb-2">
                <select className="flex-1 flex-start dark:bg-gray-800 p-2 border border-gray-500 rounded"
                        name="source-lang"
                        value={activeLanguages.source.language}
                        onChange={onSourceLanguageChange}>
                    {sourceOptions}
                </select>
                <button className="flex-none mx-2 px-2" onClick={reverseDirection}  disabled={disabled}>
                    <svg className="button_icon fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M43 171l85 85v-64h320v-43h-320v-64zM469 341l-85 -85v64h-320v43h320v64z"></path></svg>
                </button>
                <select className="flex-1 flex-end  dark:bg-gray-800 p-2 border border-gray-500 rounded"
                        name="target-lang"
                        value={activeLanguages.target.language}
                        onChange={onTargetLanguageChange}>
                    {targetOptions}
                </select>
            </div>
            <div className="flex flex-col md:flex-row justify-center place-items-center">
                <div className="flex-grow w-full">
                    <TextareaAutosize 
                      minRows={5}
                      onHeightChange={onHeightChange}
                      value={query}
                      onChange={outputTextareaValue}
                      disabled={disabled}
                      placeholder="Enter or paste text to translate"
                      className="dark:bg-gray-600 p-2 w-full border border-gray-500 rounded"
                      autoComplete="off"
                      lang={activeLanguages.source.language}
                    />
                </div>
                <div className="flex-grow w-full">
                    <textarea
                        style={targetTextAreaStyle}
                        value={translation}
                        readOnly={true}
                        disabled={disabled}
                        placeholder="Translation"
                        className="dark:bg-gray-700 p-2 w-full border border-gray-500 rounded"
                        autoComplete="off"
                        lang={activeLanguages.target.language}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default TranslateForm;