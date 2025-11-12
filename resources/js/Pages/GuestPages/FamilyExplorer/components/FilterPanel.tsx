import { useState } from 'react';

interface FilterPanelProps {
    states: string[];
    tribes: string[];
    selectedState: string;
    selectedTribe: string;
    sortBy: string;
    onFilter: (state: string, tribe: string, sort: string) => void;
    onClear: () => void;
    hasFilters: boolean;
}

export default function FilterPanel({
    states,
    tribes,
    selectedState,
    selectedTribe,
    sortBy,
    onFilter,
    onClear,
    hasFilters,
}: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilter(e.target.value, selectedTribe, sortBy);
    };

    const handleTribeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilter(selectedState, e.target.value, sortBy);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilter(selectedState, selectedTribe, e.target.value);
    };

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <button
                    className="filter-toggle"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span>⚙️ Filters</span>
                    <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                </button>
                {hasFilters && (
                    <button className="filter-clear" onClick={onClear}>
                        Clear
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="filter-content">
                    <div className="filter-group">
                        <label htmlFor="state-filter">State</label>
                        <select
                            id="state-filter"
                            value={selectedState}
                            onChange={handleStateChange}
                            className="filter-select"
                        >
                            <option value="">All States</option>
                            {states.map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </div>

                    {tribes.length > 0 && (
                        <div className="filter-group">
                            <label htmlFor="tribe-filter">Tribe</label>
                            <select
                                id="tribe-filter"
                                value={selectedTribe}
                                onChange={handleTribeChange}
                                className="filter-select"
                            >
                                <option value="">All Tribes</option>
                                {tribes.map((tribe) => (
                                    <option key={tribe} value={tribe}>
                                        {tribe}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <label htmlFor="sort-filter">Sort By</label>
                        <select
                            id="sort-filter"
                            value={sortBy}
                            onChange={handleSortChange}
                            className="filter-select"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="members">Most Members</option>
                            <option value="recent">Recently Active</option>
                            <option value="alphabetical">Alphabetical</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
