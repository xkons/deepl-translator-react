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

    const reverseDirection = () => {
        onLanguagesChange({ source: activeLanguages.target, target: activeLanguages.source });
    }

    return (
        <div>
            <div className="languages_container">
                <span>Übersetze </span><strong>{activeLanguages.source.name}</strong>
                <button onClick={reverseDirection}  disabled={disabled}>
                    <svg className="button_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M43 171l85 85v-64h320v-43h-320v-64zM469 341l-85 -85v64h-320v43h320v64z"></path></svg>
                </button>
                <span>Nach </span><strong>{activeLanguages.target.name}</strong>
            </div>
            <div className="language_container language_container--origin">
                <div className="lmt__textarea_container">
                    <textarea value={query} onChange={outputTextareaValue} disabled={disabled} className="lmt__textarea lmt__source_textarea lmt__textarea_base_style" data-gramm_editor="false" autoComplete="off" lang="en-EN">
                    </textarea>
                </div>
            </div>
            <div className="language_container language_container--target">
                <div className="lmt__textarea_container">
                    <textarea value={translation} readOnly={true} disabled={disabled} className="lmt__textarea lmt__source_textarea lmt__textarea_base_style" data-gramm_editor="false" autoComplete="off" lang="en-EN">
                    </textarea>
                </div>
            </div>
        </div>
    );
};

export default TranslateForm;