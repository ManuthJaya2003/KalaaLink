const express = require("express");
const router = express.Router();

// Simple keyword-based rules
const rules = [
  { keywords: ["hello", "hi", "hey", "good morning", "good evening"], reply: "Hey there! 👋 Welcome to KalaaLink 🎨 How can I help you today?" },
  { keywords: ["how are you", "what's up", "how's it going"], reply: "I'm great and ready to help you explore KalaaLink! What would you like to do today?" },
  { keywords: ["who are you", "what is kalaalink?", "tell me about kalaalink?"], reply: "KalaaLink is your one-stop creative hub — a platform where artists, art lovers, and event organizers connect, showcase, and grow together 🌍." },
  { keywords: ["how can I become an artist?", "how do I register as an artist?", "I want to showcase my art"], reply: "You can easily register as an artist by heading to the 'Artist' section. Create your profile, upload your artworks, and start gaining exposure!" },
  { keywords: ["can I edit my artist profile", "how do I update my artist info"], reply: "Yes! Just log into your account, go to your artist dashboard, and you’ll find all your profile management options there." },
  { keywords: ["how do I get more exposure", "how to reach more art lovers"], reply: "You can take part in events, feature in the virtual art gallery, or list your works in the marketplace to increase your visibility 💫." },
  { keywords: ["how can I sell my artwork", "how to add products", "I want to sell paintings"], reply: "Go to the Marketplace section in your artist dashboard and click 'Add Product'. Fill in your artwork details and pricing — and you’re good to go!" },
  { keywords: ["how do I buy art", "how can I purchase", "where to buy artworks"], reply: "You can browse our Marketplace 🛍️ to explore and buy unique artworks from verified artists." },
  { keywords: ["can I get a refund", "I want to refund my order", "how do I cancel my order"], reply: "Refunds can be requested from your order history page. Once reviewed, you’ll receive a confirmation email about your refund." },
  { keywords: ["how to register for an event", "I want to join an event", "can artists take part in events"], reply: "Yes! Artists can register for upcoming events directly from their dashboard. Simply go to the Events tab and click 'Register' for the event you want to join." },
  { keywords: ["where can I see upcoming events", "are there any events soon", "what events are available"], reply: "You can explore all upcoming art events in the Events section of KalaaLink. Don’t miss your chance to showcase your talent!" },
  { keywords: ["is there a registration fee?", "do I have to pay to join an event"], reply: "Some events may require a small registration fee. Payment is handled securely through our integrated payment system 💳." },
  { keywords: ["how do I donate", "I want to support an artist", "can I sponsor someone"], reply: "That’s wonderful! You can support artists directly through our Donations section or by sponsoring creative projects ❤️." },
  { keywords: ["where do my donations go", "how are donations used"], reply: "All donations go directly to support artists and fund cultural initiatives within KalaaLink’s community. Transparency is our priority 💫." },
  { keywords: ["how to become a partner", "I want to collaborate", "can my organization join kalalink"], reply: "We’d love to have you onboard! You can submit a partnership request via the Donor Dashboard. Once reviewed, we’ll get in touch via email 📧." },
  { keywords: ["how long does partnership approval take", "what happens after I apply for partnership"], reply: "Our team reviews all partnership requests within a few business days. You’ll receive an email once it’s approved or if we need more info." },
  { keywords: ["how can I contact support", "I need help", "where can I get assistance"], reply: "You can reach us anytime through our Contact Us page or email us at kalaalink@gmail.com 📩. We’re here to help!" },
  { keywords: ["I have a complaint", "I want to report an issue", "I have a problem"], reply: "We’re sorry to hear that 😔 You can lodge a complaint directly through the Contact Us page, and our team will get back to you shortly." },
  { keywords: ["how to switch to dark mode", "can I enable dark theme"], reply: "Yes! KalaaLink now supports Dark Mode 🌙 — just toggle the theme icon in the header to switch between modes." },
  { keywords: ["can I use another language", "is translation available"], reply: "Absolutely! You can translate KalaaLink into Sinhala, Tamil, English, and more via the language selector in the top menu 🌐." },
  { keywords: ["thank you", "thanks a lot", "appreciate it"], reply: "You're very welcome! 💖 Always happy to assist you." },
  { keywords: ["bye", "see you", "goodbye"], reply: "Goodbye 👋 Have a creative day ahead!" },
  {keywords: ["Oi"], reply: "Ai do?" },
  {keywords: ["I'm Bhagi"], reply: "Mokada yako?" },
  
  

  
];

// POST /api/chatbot
router.post("/", (req, res) => {
  try {
    const { message } = req.body || {};
    const text = (message || "").toString().trim().toLowerCase();

    if (!text) {
      return res.json({ reply: "Sorry, I didn’t quite catch that. Could you rephrase?" });
    }

    const match = rules.find(rule =>
      Array.isArray(rule.keywords) && rule.keywords.some(k => text.includes(k.toLowerCase()))
    );

    const reply = match
      ? match.reply
      : "Sorry, I didn’t quite catch that. Could you rephrase?";

    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ reply: "Sorry, something went wrong. Please try again." });
  }
});

module.exports = router;


