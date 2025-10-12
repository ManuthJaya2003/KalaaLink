import emailjs from "emailjs-com";

// EmailJS configuration for marketplace order refund notifications
const EMAILJS_CONFIG = {
  serviceId: "service_0jbhj7z",
  publicKey: "3GF2uYtybb1W9D_Le",
  templateId: "template_jitj4jk"
};

/**
 * Sends email notification when an order status is changed to "Refunded"
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @returns {Promise} EmailJS send promise
 */
export const sendRefundNotificationEmail = (customerEmail, customerName) => {
  const templateParams = {
    to_email: customerEmail,
    to_name: customerName,
    subject: "Your KalaaLink Order Has Been Refunded",
    message: `Hello ${customerName}, We wanted to inform you that your recent order(s) in KalaaLink has been successfully refunded. The refunded amount should reflect in your original payment method within a few business days, depending on your bank or payment provider. Order Status: Refunded. We apologize for any inconvenience caused and thank you for your understanding. If you have any questions or concerns, please do not hesitate to reach out to our support team. Best regards, The KalaaLink Marketplace Team`
  };

  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templateId,
    templateParams,
    EMAILJS_CONFIG.publicKey
  );
};

/**
 * Sends refund notification email with error handling
 * This function is safe to call and will not throw errors
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @returns {Promise<boolean>} Returns true if email was sent successfully, false otherwise
 */
export const sendRefundEmailSafely = async (customerEmail, customerName) => {
  try {
    if (!customerEmail || !customerName) {
      console.warn('Cannot send refund email: missing customer email or name');
      return false;
    }

    await sendRefundNotificationEmail(customerEmail, customerName);
    console.log(`✅ Refund notification email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send refund notification email:', error);
    return false;
  }
};
