// frontend/src/components/ui/ToastNotification.jsx
import React from "react";
import { toast } from "sonner";

/**
 * Utility functions for displaying toast notifications using Sonner
 * This provides a consistent interface for toast notifications across the application
 */
export const showToast = {
  /**
   * Show a success toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Additional options for the toast
   */
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  /**
   * Show an error toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Additional options for the toast
   */
  error: (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Show an info toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Additional options for the toast
   */
  info: (message, options = {}) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  /**
   * Show a warning toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Additional options for the toast
   */
  warning: (message, options = {}) => {
    toast.warning(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Show a loading toast notification that can be updated
   * @param {string} message - The message to display
   * @param {Object} options - Additional options for the toast
   * @returns {string} - The ID of the toast that can be used to update it
   */
  loading: (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity, // Loading toasts should stay until dismissed
      ...options,
    });
  },

  /**
   * Show a promise toast notification that changes based on the promise result
   * @param {Promise} promise - The promise to track
   * @param {Object} messages - Object containing loading, success, and error messages
   * @param {Object} options - Additional options for the toast
   */
  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || "Loading...",
      success: messages.success || "Success!",
      error: messages.error || "An error occurred",
      ...options,
    });
  },
};

export default showToast;