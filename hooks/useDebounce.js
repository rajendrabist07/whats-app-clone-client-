import { useState, useEffect } from 'react';

// Prevents calling API on every keystroke
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer); // Cleanup on every change
    }, [value, delay]);

    return debouncedValue;
};

// Usage in SearchUsers.jsx:
// const debouncedSearch = useDebounce(searchQuery, 500);
// useEffect(() => { if (debouncedSearch) searchUsers(debouncedSearch); }, [debouncedSearch]);