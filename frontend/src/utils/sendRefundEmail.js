import emailjs from "emailjs-com";

export const sendRefundEmail = (customerEmail, customerName, eventName, refundAmount) => {
  const templateParams = {
    to_email: customerEmail,
    to_name: customerName,
    event_name: eventName,
    refund_amount: refundAmount || "N/A"
  };

  return emailjs.send(
    "service_pgy8fxb",
    "template_qb5it5c",
    templateParams,
    "Imob_khk9IZWGcLjp"
  );
};
