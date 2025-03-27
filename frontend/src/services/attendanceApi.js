import api from './api';

const attendanceApi = {
  // Staff endpoints
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.put('/attendance/check-out'),
  getMyAttendance: (startDate, endDate) => {
    let url = '/attendance';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get(url);
  },
  
  // Admin endpoints
  getAllAttendance: (params) => {
    let url = '/attendance/all';
    const queryParams = [];
    
    if (params?.startDate) queryParams.push(`startDate=${params.startDate}`);
    if (params?.endDate) queryParams.push(`endDate=${params.endDate}`);
    if (params?.staffId) queryParams.push(`staffId=${params.staffId}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return api.get(url);
  },
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  getAttendanceSummary: (month, year) => {
    let url = '/attendance/summary';
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    return api.get(url);
  }
};

export default attendanceApi;