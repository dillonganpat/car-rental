import 'dotenv/config';
import connectDB from './configs/db.js';
import app from './app.js';

connectDB();

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

export default app;
