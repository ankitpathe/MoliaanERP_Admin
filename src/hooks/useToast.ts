import { useToast as useGlobalToast } from '../context/ToastContext';

export const useToast = () => {
  return useGlobalToast();
};
