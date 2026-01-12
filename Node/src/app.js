import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// --- Middleware ---
app.use(express.json({ limit: '10kb' })); // Parse JSON
app.use(helmet());                         // Security headers

// Enable CORS
app.use(cors({
  origin: ['http://localhost:4000'],       // Allowed origins
  methods: ['GET','POST','PUT','DELETE'],
}));

// Rate limiting (max 100 requests per 15 min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try later'
});
app.use(limiter);

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Newton server running 🚀 2026');
});

export default app;
