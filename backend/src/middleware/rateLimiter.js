require("dotenv").config();
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/crm";

const passwordResetLimiter = rateLimit({
  store: new MongoStore({
    uri: uri,
    collectionName: "rateLimits_passwordReset",
    expireTimeMs: 24 * 60 * 60 * 1000,
  }),

  windowMs: 24 * 60 * 60 * 1000,
  max: 5,

  keyGenerator: (req, res) => {
    const ip = rateLimit.ipKeyGenerator(req);
    const email = req.body?.email?.toLowerCase().trim() || "unknown-email";
    return `${ip}-${email}`;
  },

  skip: (req) => !req.body?.email,

  message: {
    success: false,
    message: "Too many reset requests. Please try again after 24 hours.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  passwordResetLimiter,
};
