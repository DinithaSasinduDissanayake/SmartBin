import api from './api';

const getStatistics = async (params = {}) => {
    try {
        // Ensure params are correctly formatted for query strings
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/statistics?${queryParams}`);
        // Assuming the backend returns { status: 'success', data: {...} }
        if (response.data && response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data?.message || 'Failed to fetch statistics data');
        }
    } catch (error) {
        console.error('Error fetching statistics:', error.response?.data || error.message);
        // Rethrow a more specific error or the original error message
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch statistics');
    }
};

export default { getStatistics };
