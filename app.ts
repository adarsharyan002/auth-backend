import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDb from './db/connect';
import authRouter from './routes/auth';
import notFound from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';
// import 'dotenv/config'
// require('dotenv').config();
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });

const app: Application = express();

// Trusting first proxy
app.set('trust proxy', 1);

// Rate limiter middleware
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Parse JSON request body
app.use(express.json());

// Extra security and middleware
app.use(helmet());
app.use(cors());


// Routes
app.use('/api/v1/auth', authRouter);

// Not found middleware (404)
app.use(notFound);

// Error handler middleware
app.use(errorHandlerMiddleware);

const port: number | string = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  try {
    await connectDb(process.env.MONGO_URI || '');
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error:any) {
    console.error(`Error starting server: ${error.message}`);
  }
};

start();
