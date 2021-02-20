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
    }
    const onHeightChange = (height: number) => setTextAreaHeight(height);

    const targetTextAreaStyle = {
        height: textAreaHeight
    };

    return (
        <div className="container mx-auto px-4 w-full">
            <div className="flex flex-row justify-center flex-nowrap mb-2">
                <strong className="flex-1 flex-start">{activeLanguages.source.name}</strong>
                <button className="flex-none" onClick={reverseDirection}  disabled={disabled}>
                    <svg className="button_icon fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M43 171l85 85v-64h320v-43h-320v-64zM469 341l-85 -85v64h-320v43h320v64z"></path></svg>
                </button>
                <strong className="flex-1 flex-end">{activeLanguages.target.name}</strong>
            </div>
            <div className="flex flex-col md:flex-row justify-center place-items-center">
                <div className="flex-grow w-full">
                    <TextareaAutosize 
                      minRows={5}
                      onHeightChange={onHeightChange}
                      value={query}
                      onChange={outputTextareaValue}
                      disabled={disabled}
                      className="dark:bg-gray-600 w-full"
                      autoComplete="off"
                      lang={activeLanguages.source.language}
                    />
                </div>
                <div className="flex-grow w-full">
                    <TextareaAutosize
                        minRows={5}
                        style={targetTextAreaStyle}
                        value={translation}
                        readOnly={true}
                        className="dark:bg-gray-700 w-full"
                        autoComplete="off"
                        lang={activeLanguages.target.language}
                    />
                </div>
            </div>
        </div>
    );
};

export default TranslateForm;