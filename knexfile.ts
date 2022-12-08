import dotenv from "dotenv";
import { knexSnakeCaseMappers } from "objection";

// Need to initialize here along with `app.ts` also to run migrations
dotenv.config();

import {
  dbClient,
  dbHost,
  dbUser,
  dbPassword,
  dbName,
  dbPort,
} from "./configs/config";

import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: dbClient,
    connection: {
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: Number(dbPort),
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    ...knexSnakeCaseMappers(),
  },
};

export default config;
