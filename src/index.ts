import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import responseTime from "response-time";
import { config } from "./config";
import { connectDatabase } from "./config/database";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs, resolvers } from "./graphql";

interface Context {
  user?: { id: string };
}

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        imgSrc: [
          `'self'`,
          "data:",
          "apollo-server-landing-page.cdn.apollographql.com",
        ],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        manifestSrc: [
          `'self'`,
          "apollo-server-landing-page.cdn.apollographql.com",
        ],
        frameSrc: [`'self'`, "sandbox.embed.apollographql.com"],
      },
    },
  })
);
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

const startServer = async () => {
  await connectDatabase();

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return { user: undefined };
        }

        const token = authHeader.substring(7);
        try {
          const { verifyToken } = await import("./utils/jwt");
          const payload = verifyToken(token);
          return { user: payload };
        } catch {
          return { user: undefined };
        }
      },
    })
  );

  app.listen(config.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.port}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${config.port}/graphql`);
  });
};

startServer();
