const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const hackrxRoutes = require('./routers/hackrx');
app.use('/api/v1/hackrx', hackrxRoute);

// Root check
app.get('/', (req, res) => {
  res.send('ClauseMind AI backend is running 🚀');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});