"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
// Load test environment variables
dotenv_1.default.config({ path: ".env.test" });
// Set default test environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.JWT_SECRET =
    process.env.JWT_SECRET || "test-secret-key-for-jwt-testing";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES || "5";
let mongoServer;
// Connect to in-memory database before all tests
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose_1.default.connect(mongoUri);
});
// Clear database between tests
afterEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
// Disconnect and stop server after all tests
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
//# sourceMappingURL=setup.js.map