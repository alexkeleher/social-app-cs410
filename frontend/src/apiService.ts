import axios from 'axios';
import { User, Group } from './interfaces/index';

const API_URL = process.env.API_URL;

export const getUsers = async (): Promise<User[]> => {
    const response = await axios.get<User[]>('http://localhost:5000/users');
    return response.data;
};

export const createUser = async (userData: User): Promise<User> => {
    const response = await axios.post<{ InsertedEntry: User }>(`${API_URL}/users`, userData);
    return response.data.InsertedEntry;
};

export const getGroups = async (): Promise<Group[]> => {
    const response = await axios.get<Group[]>(`${API_URL}/groups`);
    return response.data;
};

export const createGroup = async (groupData: Group): Promise<Group> => {
    const response = await axios.post<{ InsertedEntry: Group }>(`${API_URL}/groups`, groupData);
    return response.data.InsertedEntry;
};
