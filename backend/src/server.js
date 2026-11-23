import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`ResolveDesk API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error(`ResolveDesk startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
