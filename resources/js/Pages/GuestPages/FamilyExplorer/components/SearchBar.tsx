import { useState, useCallback } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    value: string;
}

export default function SearchBar({ onSearch, value }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onSearch(newValue);
    }, [onSearch]);

    const handleClear = () => {
        setInputValue('');
        onSearch('');
    };

    return (
        <div className="search-bar">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search by family name or state..."
                    value={inputValue}
                    onChange={handleChange}
                    className="search-input"
                />
                {inputValue && (
                    <button className="search-clear" onClick={handleClear} title="Clear search">
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
