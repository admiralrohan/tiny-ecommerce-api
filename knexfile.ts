import { knexSnakeCaseMappers } from "objection";

// Conflicting with eslint, yet to figure out the root cause
// eslint-disable-next-line prettier/prettier
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
