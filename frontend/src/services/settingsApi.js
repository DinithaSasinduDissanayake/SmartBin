import api from './api'; // Your configured axios instance

const settingsApi = {
    getSettings: async () => {
        try {
            const response = await api.get('/settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching settings:', error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to fetch settings');
        }
    },

    updateSettings: async (settingsData) => {
        try {
            const response = await api.put('/settings', settingsData);
            return response.data;
        } catch (error) {
            console.error('Error updating settings:', error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to update settings');
        }
    }
};

export default settingsApi;