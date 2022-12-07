/**
 * We will use this file for importing env variables across the project,
 * won't directly import from .env.
 */

export const dbClient = process.env.DB_CLIENT;
export const dbHost = process.env.DB_HOST;
export const dbUser = process.env.DB_USER;
export const dbPassword = process.env.DB_PASSWORD;
export const dbName = process.env.DB_NAME;
export const dbPort = process.env.DB_PORT;

export const jwtSecret = process.env.JWT_SECRET;
export const saltRounds = process.env.SALT_ROUNDS || 10;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "30d";
