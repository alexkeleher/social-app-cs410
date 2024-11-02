import axios from 'axios';
import { User, Group } from '@types';

const API_URL = process.env.REACT_APP_API_URL;

export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get<User[]>(`${API_URL}/users`);
        return response.data;
    } catch (e) {
        console.error('Error fetching users:', e);
        throw e;
    }
};

export const createUser = async (userData: User): Promise<User> => {
    try {
        const response = await axios.post<{ InsertedEntry: User }>(`${API_URL}/users`, userData);
        return response.data.InsertedEntry;
    } catch (e) {
        console.error('Error creating user:', e);
        throw e;
    }
};

export const getGroups = async (): Promise<Group[]> => {
    try {
        const response = await axios.get<Group[]>(`${API_URL}/groups`);
        return response.data;
    } catch (e) {
        console.error('Error fetching groups:', e);
        throw e;
    }
};

export const createGroup = async (groupData: Group): Promise<Group> => {
    try {
        const response = await axios.post<{ InsertedEntry: Group }>(`${API_URL}/groups`, groupData);
        return response.data.InsertedEntry;
    } catch (e) {
        console.error('Error creating group:', e);
        throw e;
    }
};
