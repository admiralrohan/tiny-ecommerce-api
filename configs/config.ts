/**
 * We will use this file for importing env variables across the project,
 * won't directly import from .env.
 */

export const dbClient = process.env.DB_CLIENT;
export const dbDevUrl = process.env.DB_DEV_URL;
export const dbProdUrl = process.env.DB_PROD_URL;
export const dbTestUrl = process.env.DB_TEST_URL;

export const jwtSecret = process.env.JWT_SECRET;
export const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "30d";

export const port = process.env.PORT || 8000;
