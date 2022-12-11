import Knex from "knex";
import knexConfig from "./knexfile";
import { Model } from "objection";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let knex: any;

beforeEach(async () => {
  knex = Knex(knexConfig.test);
  Model.knex(knex);
  await knex.migrate.latest();
});

afterEach(async () => {
  await knex.migrate.rollback();
  await knex.destroy();
});
