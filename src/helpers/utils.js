import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const postData = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response.data; // axios auto-parses JSON
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};
