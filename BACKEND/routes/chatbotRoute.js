const express = require("express");
const router = express.Router();

// Simple keyword-based rules
const rules = [
  { keywords: ["hello", "hi"], reply: "Hey there! Welcome to KalaaLink 🎨 How can I assist you today?" },
  { keywords: ["artist"], reply: "Artists can showcase their work, manage their profiles, and gain exposure here!" },
  { keywords: ["event"], reply: "You can explore or register for upcoming art events in the Events section." },
  { keywords: ["marketplace"], reply: "The marketplace allows artists to sell and customers to buy unique artworks." },
  { keywords: ["donation", "support"], reply: "Support your favorite artists through our donation and sponsorship features ❤️." },
  { keywords: ["contact"], reply: "Reach out to us anytime at info@kalaalink.com or call +94-11-2223344." },
  {keywords: ["Oi"], reply: "Ai do?" },
  {keywords: ["I'm Asiri"], reply: "Heyy. I know you gay boii" },
  
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


