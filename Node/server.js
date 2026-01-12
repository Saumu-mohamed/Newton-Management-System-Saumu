import app from './src/app.js';

const PORT = 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
