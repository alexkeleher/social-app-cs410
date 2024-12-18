//import axios from 'axios';
import api from './axios';
import { User, Group, GroupAndCreator } from '@types';

const API_URL = process.env.REACT_APP_API_URL;

export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get<User[]>(`${API_URL}/users`);
        return response.data;
    } catch (e) {
        console.error('Error fetching users:', e);
        throw e;
    }
};

export const createUser = async (userData: User): Promise<User> => {
    try {
        const response = await api.post<{ InsertedEntry: User }>(`${API_URL}/users`, userData);
        return response.data.InsertedEntry;
    } catch (e) {
        console.error('Error creating user:', e);
        throw e;
    }
};

export const getGroups = async (): Promise<Group[]> => {
    try {
        const response = await api.get<Group[]>(`${API_URL}/groups`);
        return response.data;
    } catch (e) {
        console.error('Error fetching groups:', e);
        throw e;
    }
};

export const createGroup = async (groupData: GroupAndCreator): Promise<Group> => {
    try {
        const response = await api.post<{ InsertedEntry: Group }>(`${API_URL}/groups`, groupData);
        return response.data.InsertedEntry;
    } catch (e) {
        console.error('Error creating group:', e);
        throw e;
    }
};
