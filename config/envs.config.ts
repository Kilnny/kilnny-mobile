const productionApiUrl = 'https://kilnny-server.onrender.com/api';
const productionWsUrl = 'https://kilnny-server.onrender.com';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || productionApiUrl;
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || productionWsUrl;
