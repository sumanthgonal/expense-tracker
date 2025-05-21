import axios from 'axios';
import { Expense } from '@/context/ExpenseContext';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api`;
  } else {
    return 'http://192.168.1.1:3000/api'; // Replace with your computer's IP address
  }
};

const API_URL = getApiUrl();

export const expenseApi = {
  async getExpenses(since?: string): Promise<Expense[]> {
    try {
      const url = since ? `${API_URL}/expenses?since=${since}` : `${API_URL}/expenses`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('API Error - getExpenses:', error);
      throw error;
    }
  },
  
  async addExpense(expense: Omit<Expense, '_id'>): Promise<Expense> {
    try {
      const response = await axios.post(`${API_URL}/expenses`, expense);
      return response.data;
    } catch (error) {
      console.error('API Error - addExpense:', error);
      throw error;
    }
  },
  
  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    try {
      const response = await axios.put(`${API_URL}/expenses/${id}`, expense);
      return response.data;
    } catch (error) {
      console.error('API Error - updateExpense:', error);
      throw error;
    }
  },
  
  async deleteExpense(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
    } catch (error) {
      console.error('API Error - deleteExpense:', error);
      throw error;
    }
  },
  
  async batchSync(expenses: Expense[]): Promise<Expense[]> {
    try {
      const response = await axios.post(`${API_URL}/expenses/sync`, { expenses });
      return response.data;
    } catch (error) {
      console.error('API Error - batchSync:', error);
      throw error;
    }
  },
  
  async exportCSV(): Promise<string> {
    try {
      const response = await axios.get(`${API_URL}/expenses/export`, {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('API Error - exportCSV:', error);
      throw error;
    }
  }
};