import express from 'express';
import registerRoute from './routes/register';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', registerRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
