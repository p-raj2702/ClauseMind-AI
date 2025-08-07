const express = require('express');
const router = express.Router();

// POST /api/v1/hackrx/run
router.post('/run', (req, res) => {
  console.log('Received data from HackRx webhook:', req.body);

  // Sample response (customize this later)
  return res.json({
    decision: "Approved ✅",
    summary: "This clause satisfies the user's query about hospitalization coverage.",
    confidence: 92.5,
    clause: "Hospitalization is covered for a minimum of 24 hours...",
  });
});

module.exports = router;