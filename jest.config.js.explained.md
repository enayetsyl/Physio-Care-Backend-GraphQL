# Jest Configuration Explained - Step by Step

This document explains every line of `jest.config.js` for beginners.

## What is Jest?

Jest is a JavaScript testing framework. Think of it as a tool that:

- Runs your test files
- Checks if your code works correctly
- Reports which tests passed or failed
- Shows how much of your code is tested (coverage)

## Understanding the Configuration File

```javascript
module.exports = {
  // Configuration options go here
};
```

This exports a JavaScript object that tells Jest how to run your tests.

---

## Line-by-Line Breakdown

### 1. `preset: "ts-jest"`

**What it does:** Tells Jest to use `ts-jest` to handle TypeScript files.

**Why it's needed:**

- Your code is written in TypeScript (`.ts` files)
- Jest normally only understands JavaScript
- `ts-jest` converts TypeScript to JavaScript on-the-fly during testing
- This means you can write tests in TypeScript without manually compiling first

**Example:**

```typescript
// Without ts-jest, Jest can't understand this:
const user: User = { id: "123" };

// With ts-jest, Jest understands TypeScript syntax
```

---

### 2. `testEnvironment: "node"`

**What it does:** Sets the testing environment to Node.js (server-side).

**Why it's needed:**

- Your backend runs on Node.js (not in a browser)
- Jest can run in different environments:
  - `"node"` - for backend/server code (your case)
  - `"jsdom"` - for frontend/browser code
  - `"jsdom"` simulates a browser environment

**Example:**

```javascript
// With testEnvironment: "node"
// You can use Node.js features like:
const fs = require("fs"); // ✅ Works
const express = require("express"); // ✅ Works

// But browser APIs won't work:
window.localStorage; // ❌ Not available
```

---

### 3. `roots: ["<rootDir>/src", "<rootDir>/tests"]`

**What it does:** Tells Jest where to look for your code and test files.

**Why it's needed:**

- `<rootDir>` = the project root (where `jest.config.js` is located)
- Jest needs to know:
  - Where your source code is (`src/`)
  - Where your test files are (`tests/`)

**Example:**

```
physio-care-backend/
├── src/              ← Your actual code
│   └── utils/
│       └── jwt.ts
├── tests/            ← Your test files
│   └── unit/
│       └── utils/
│           └── jwt.test.ts
└── jest.config.js    ← <rootDir> is here
```

**What happens:**

- Jest looks in `src/` to understand your code
- Jest looks in `tests/` to find test files

---

### 4. `testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"]`

**What it does:** Tells Jest which files are test files.

**Why it's needed:**

- Jest needs to know which files to run as tests
- This prevents Jest from running your regular code files as tests

**Pattern breakdown:**

- `**/__tests__/**/*.ts` - Any `.ts` file inside a `__tests__` folder
  ```
  src/utils/__tests__/jwt.test.ts  ✅ Test file
  ```
- `**/?(*.)+(spec|test).ts` - Any `.ts` file ending with `.spec.ts` or `.test.ts`
  ```
  tests/unit/utils/jwt.test.ts     ✅ Test file
  src/utils/jwt.spec.ts            ✅ Test file
  src/utils/jwt.ts                 ❌ Not a test (no .test or .spec)
  ```

**Example:**

```
✅ Will be run as tests:
- tests/unit/utils/jwt.test.ts
- src/utils/__tests__/helper.test.ts
- tests/integration/auth.spec.ts

❌ Will NOT be run as tests:
- src/utils/jwt.ts
- src/models/User.ts
```

---

### 5. `transform: { "^.+\\.ts$": "ts-jest" }`

**What it does:** Tells Jest to transform (convert) TypeScript files using `ts-jest`.

**Why it's needed:**

- Jest can't run TypeScript directly
- This rule says: "When you see a `.ts` file, use `ts-jest` to convert it first"

**Pattern breakdown:**

- `^.+\\.ts$` is a regular expression (regex):
  - `^` = start of filename
  - `.+` = one or more characters
  - `\\.ts` = literal `.ts` (the `\\` escapes the dot)
  - `$` = end of filename
- Translation: "Any file ending with `.ts`"

**Example:**

```
jwt.test.ts → ts-jest converts it → Jest runs it
auth.resolver.ts → ts-jest converts it → Jest runs it
```

---

### 6. `collectCoverageFrom: [...]`

**What it does:** Tells Jest which files to include when calculating test coverage.

**Why it's needed:**

- Test coverage = how much of your code is tested
- You want to measure coverage for your source code, not test files
- Some files don't need coverage (like config files)

**What each line means:**

```javascript
"src/**/*.ts"; // Include all .ts files in src/
"!src/**/*.d.ts"; // EXCLUDE TypeScript declaration files (.d.ts)
"!src/index.ts"; // EXCLUDE the main entry point
"!src/config/**"; // EXCLUDE all files in config folder
```

**The `!` means "exclude"**

**Example:**

```
✅ Included in coverage:
- src/utils/jwt.ts
- src/models/User.ts
- src/services/otp.service.ts

❌ Excluded from coverage:
- src/index.ts (just starts the server)
- src/config/index.ts (just configuration)
- src/utils/jwt.d.ts (type definitions)
```

**Why exclude these?**

- `index.ts` - Just boilerplate, not business logic
- `config/**` - Configuration files, not testable logic
- `*.d.ts` - Type definitions, not actual code

---

### 7. `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }`

**What it does:** Creates path aliases (shortcuts) for imports.

**Why it's needed:**

- Makes imports cleaner and easier
- Instead of long relative paths, you can use short aliases

**How it works:**

- `^@/(.*)$` = matches imports starting with `@/`
- `<rootDir>/src/$1` = replaces `@/` with `src/`
- `$1` = whatever comes after `@/`

**Example:**

```typescript
// Without moduleNameMapper, you'd write:
import { User } from "../../../models/User";

// With moduleNameMapper, you can write:
import { User } from "@/models/User";
// Jest automatically converts @/ to src/
```

**In your project:**

```typescript
// This import:
import { generateToken } from "@/utils/jwt";

// Gets converted to:
import { generateToken } from "src/utils/jwt";
```

**Note:** This is optional. Your current code uses relative imports (`../../`), which also work fine.

---

### 8. `setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"]`

**What it does:** Runs a setup file before each test file.

**Why it's needed:**

- Some things need to be set up before tests run
- Environment variables, database connections, global mocks, etc.

**What happens:**

1. Jest starts
2. Runs `tests/setup.ts` first
3. Then runs your test files

**Example from `tests/setup.ts`:**

```typescript
// This runs BEFORE every test file
process.env.JWT_SECRET = "test-secret-key";
// Now all tests can use this test secret
```

**Why this is useful:**

- Ensures consistent test environment
- Sets up test-specific configuration
- Avoids needing to repeat setup in every test file

---

### 9. `testTimeout: 10000`

**What it does:** Sets the maximum time a test can run (10 seconds).

**Why it's needed:**

- Prevents tests from hanging forever
- Some tests might take longer (database operations, API calls)
- Default is 5 seconds, which might be too short

**What happens:**

- If a test takes longer than 10 seconds, Jest stops it and marks it as failed
- You'll see: "Timeout - Async callback was not invoked within the 10000ms timeout"

**Example:**

```typescript
it("should connect to database", async () => {
  // If this takes 15 seconds, test will fail
  await connectDatabase();
}, 15000); // You can override timeout for specific tests
```

**When to increase:**

- Integration tests with real databases
- Tests that make external API calls
- Tests with complex setup

---

## Complete Configuration Summary

```javascript
module.exports = {
  preset: "ts-jest",                    // Use TypeScript
  testEnvironment: "node",               // Backend environment
  roots: ["<rootDir>/src", "<rootDir>/tests"],  // Where to look
  testMatch: ["**/*.test.ts"],         // Which files are tests
  transform: { "^.+\\.ts$": "ts-jest" }, // Convert TS to JS
  collectCoverageFrom: [...],          // What to measure
  moduleNameMapper: {...},             // Import shortcuts
  setupFilesAfterEnv: [...],           // Run setup first
  testTimeout: 10000,                   // Max test time
};
```

---

## How Jest Uses This Configuration

1. **You run:** `npm test`
2. **Jest reads:** `jest.config.js`
3. **Jest finds:** All `.test.ts` files in `tests/` folder
4. **Jest converts:** TypeScript to JavaScript using `ts-jest`
5. **Jest runs:** Each test file
6. **Jest reports:** Pass/fail for each test

---

## Common Questions

### Q: Do I need to understand all of this?

**A:** No! You can use this config as-is. Understanding it helps when you need to customize.

### Q: Can I change these values?

**A:** Yes! Adjust based on your needs. For example, increase `testTimeout` if tests are slow.

### Q: What if I don't have a config file?

**A:** Jest will use defaults, but they might not work well with TypeScript.

### Q: How do I know if my config is working?

**A:** Run `npm test`. If tests run without errors, your config is good!

---

## Next Steps

Now that you understand the config:

1. Try running `npm test` to see it in action
2. Look at `tests/unit/utils/jwt.test.ts` to see how tests are written
3. Write your own test following the same pattern

Happy testing! 🧪
