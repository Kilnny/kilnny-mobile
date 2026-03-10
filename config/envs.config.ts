import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host machine's localhost
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = `http://${HOST}:3000/api`;
export const WS_URL = `http://${HOST}:3000`;
