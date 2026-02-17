import { Toast, ToastType } from '@/components/ui/Toast';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
        setMessage(message);
        setType(type);
        setVisible(true);

        if (duration > 0) {
            setTimeout(() => {
                hideToast();
            }, duration);
        }
    }, [hideToast]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <Toast
                visible={visible}
                message={message}
                type={type}
                onHide={hideToast}
            />
        </ToastContext.Provider>
    );
};
