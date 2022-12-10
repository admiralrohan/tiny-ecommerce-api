import dotenv from "dotenv";
import { knexSnakeCaseMappers } from "objection";

// Need to initialize here along with `app.ts` also to run migrations
dotenv.config();

import { dbClient, dbDevUrl, dbProdUrl, dbTestUrl } from "./configs/config";

import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  dev: {
    client: dbClient,
    connection: dbDevUrl,
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" },
    ...knexSnakeCaseMappers(),
  },

  prod: {
    client: dbClient,
    connection: dbProdUrl,
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" },
    ...knexSnakeCaseMappers(),
  },

  test: {
    client: dbClient,
    connection: dbTestUrl,
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" },
    ...knexSnakeCaseMappers(),
  },
};

export default config;
