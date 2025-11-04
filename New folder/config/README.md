# Configuration Files

This folder contains all configuration files for the project.

## Files

- **`app.js`** - Main application configuration (environment variables, database settings, API settings, etc.)
- **`eslint.config.mjs`** - ESLint configuration for code linting
- **`jsconfig.json`** - JavaScript/TypeScript configuration for path mapping
- **`next.config.mjs`** - Next.js framework configuration
- **`postcss.config.mjs`** - PostCSS configuration for CSS processing

## Usage

### Application Config (`app.js`)

```javascript
import { config } from "@/config/app";

// Access configuration values
const mongoUri = config.mongoUri;
const apiUrl = config.baseUrl;
```

### Build Tools

The build tools (ESLint, Next.js, PostCSS) automatically look for their configuration files in the project root. Copies of these files are maintained in the root directory for compatibility.

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your-database
MONGO_DB_NAME=your-database-name

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Email configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Notes

- Configuration files are organized in this folder for better project structure
- Root-level copies are maintained for build tool compatibility
- All sensitive configuration should use environment variables
- The `app.js` file includes warnings for missing required environment variables
