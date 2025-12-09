import express from "express";
   import cors from "cors";
   import helmet from "helmet";
   import hpp from "hpp";
   import responseTime from "response-time";
   import { config } from "./config";
   import { connectDatabase } from "./config/database";

   const app = express();

   // Security middleware
   app.use(helmet());
   app.use(hpp());
   app.use(cors());
   app.use(express.json());
   app.use(responseTime());

   // Health check endpoint
   app.get("/health", (req, res) => {
     res.json({
       status: "ok",
       timestamp: new Date().toISOString(),
       environment: config.env,
     });
   });

   app.listen(config.port, async() => {
    await connectDatabase();

     console.log(`🚀 Server running at http://localhost:${config.port}`);
     console.log(`📋 Health check: http://localhost:${config.port}/health`);
   });