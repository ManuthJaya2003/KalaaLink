import emailjs from "emailjs-com";

// EmailJS configuration for marketplace customization status emails
const EMAILJS_CONFIG = {
  serviceId: "service_v2ma6iq",
  publicKey: "A0_3LIbsDKjpM2nkT",
  templates: {
    inProgress: "template_qtci5sl", // Template for "In Progress" status
    completed: "template_ehglz6p"   // Template for "Completed" status
  }
};

/**
 * Sends email notification when customization request status changes to "In Progress"
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @returns {Promise} EmailJS send promise
 */
export const sendInProgressEmail = (customerEmail, customerName) => {
  const templateParams = {
    to_email: customerEmail,
    to_name: customerName,
    subject: "Your Marketplace Customization Request is Now In Progress",
    message: `Hello ${customerName}, Your customization request has been successfully received and is now in progress. Our team is working on it, and we will notify you when completed. Request Status: In Progress. Best regards, The KalaaLink Marketplace Team`
  };

  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templates.inProgress,
    templateParams,
    EMAILJS_CONFIG.publicKey
  );
};

/**
 * Sends email notification when customization request status changes to "Completed"
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @returns {Promise} EmailJS send promise
 */
export const sendCompletedEmail = (customerEmail, customerName) => {
  const templateParams = {
    to_email: customerEmail,
    to_name: customerName,
    subject: "Your Marketplace Customization Request Has Been Completed",
    message: `Hello ${customerName}, Your customization request has been successfully completed. Request Status: Completed. Thank you for being a valued KalaaLink user. Best regards, The KalaaLink Marketplace Team`
  };

  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templates.completed,
    templateParams,
    EMAILJS_CONFIG.publicKey
  );
};

/**
 * Sends appropriate email based on status change
 * Only sends emails for "in-progress" and "completed" statuses
 * @param {string} newStatus - The new status of the customization request
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @returns {Promise|null} EmailJS send promise or null if no email should be sent
 */
export const sendStatusChangeEmail = (newStatus, customerEmail, customerName) => {
  // Validate required parameters
  if (!customerEmail || !customerName) {
    console.warn('Missing customer email or name for status change notification');
    return null;
  }

  // Only send emails for specific statuses
  switch (newStatus) {
    case 'in-progress':
      return sendInProgressEmail(customerEmail, customerName);
    case 'completed':
      return sendCompletedEmail(customerEmail, customerName);
    default:
      // No email for other statuses (pending, cancelled)
      return null;
  }
};
