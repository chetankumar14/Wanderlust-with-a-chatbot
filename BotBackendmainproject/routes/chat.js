// routes/chat.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Listing = require("../models/listing"); // MongoDB model

// Initialize Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {


  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.json({ reply: "Please enter a message." });
    }

    // 1️⃣ Fetch listings from DB (limit 10 for prompt size)
    const listings = await Listing.find({});

      if (listings.length === 0) {
  return res.json({ reply: "Currently, there are no listings available on Wanderlust." });
}

    // 2️⃣ Convert listings to readable text
    const listingData = listings.map(l =>
      `Title: ${l.title}, Price: ₹${l.price}/night, Location: ${l.location || "N/A"}, Country: ${l.country || "N/A"}`
    ).join("\n");

    // 3️⃣ Create system prompt restricting AI to Wanderlust website
    const prompt = `
You are a professional travel assistant for the Wanderlust website, which offers vacation rentals, villas, cabins, and unique accommodations.
Your task is to help users navigate the website, answer questions about available listings, pricing, and locations, and provide guidance about booking options.

Guidelines:
1. Answer ONLY using the listings provided below. Do NOT invent new listings or prices.
2. Keep responses friendly, concise, and professional.
3. If the user's question is unrelated to Wanderlust or the listings, politely reply:
   "I can only help with Wanderlust website listings and services."
4. Always provide accurate information from the listings.
5. Do not provide personal opinions or external information outside of the provided listings.
6. Help users navigate the website, including how to add or manage listings, book properties, and find information.
7. Provide step-by-step guidance based on this structure. For example:
       - "To view details, click the property image."
       - "To edit a listing, click the Edit button on the details page."
The website has a navbar with links: Home, Listings, New Listing.
The website has a footer with links:facebook,instagram,Linkedin,Privacy terms,and the company name Wanderlust Private Limited
The "New Listing" link allows hosts to add new properties.
Each listing is displayed with an image. Clicking the image opens the **listing details page**.
   - Listing details include:
       - Title
       - Description
       - Price
       - Location
       - Country
   - On the details page, there are **Edit** and **Delete** buttons.
       - Clicking **Edit** opens a **new edit page** that allows the user to update the current listing.
       - Clicking **Delete** removes the current listing.
Users can browse listings by title, price, location, and country.


Answer ONLY using the listings provided below. Always include **all listings that match the user's request**.

Website Listings:
${listingData}

User Question:
${message}
`;

    // 4️⃣ Use a supported Gemini chat model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash" // <- Replace with the exact available model from your Google Cloud project
    });

    // 5️⃣ Generate AI response
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const reply = result.response.text();

    // 6️⃣ Return reply to frontend
    res.json({ reply });

  } catch (err) {
    console.error("FULL ERROR:", err);

    // Rate limit / quota error
    if (err.status === 429) {
      return res.status(429).json({ reply: "Rate limit exceeded. Please try again later." });
    }

    // Model not found error (wrong model name)
    if (err.status === 404) {
      return res.status(404).json({ reply: "The AI model is not available for your project. Please check your API key and model name." });
    }

    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
});

module.exports = router;
