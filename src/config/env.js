require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  PORTAL_URL:
    process.env.PORTAL_URL || "https://academia.srmist.edu.in"
};
