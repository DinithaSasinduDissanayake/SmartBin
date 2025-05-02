// frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls that manages loading, error states, and request functionality
 * @param {Function} apiFunction - The API function to call (should return a promise)
 * @returns {Object} Object containing data, loading state, error state, and request function
 */
const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunction(...args);
            setData(response);
            return response;
        } catch (err) {
            setError(err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    return { data, loading, error, request };
};

export default useApi;