import { toast as toastify } from 'react-toastify';

/**
 * Toast notification utilities
 * Replaces alert() with professional, non-blocking notifications
 */

const defaultOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const toast = {
  success: (message, options = {}) => {
    return toastify.success(message, { ...defaultOptions, ...options });
  },

  error: (message, options = {}) => {
    return toastify.error(message, { ...defaultOptions, autoClose: 6000, ...options });
  },

  warning: (message, options = {}) => {
    return toastify.warning(message, { ...defaultOptions, autoClose: 5000, ...options });
  },

  info: (message, options = {}) => {
    return toastify.info(message, { ...defaultOptions, ...options });
  },

  loading: (message) => {
    return toastify.loading(message, { ...defaultOptions, autoClose: false });
  },

  promise: (promise, messages) => {
    return toastify.promise(promise, {
      pending: messages.pending || 'Processing...',
      success: messages.success || 'Success!',
      error: messages.error || 'Failed',
    }, defaultOptions);
  },

  update: (toastId, options) => {
    return toastify.update(toastId, options);
  },

  dismiss: (toastId) => {
    return toastify.dismiss(toastId);
  },

  dismissAll: () => {
    return toastify.dismiss();
  }
};
