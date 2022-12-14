import Knex from "knex";
import knexConfig from "./knexfile";
import { Model } from "objection";
import { currentTime, mockToken } from "./configs/constants";

jest.mock("./utils/jwt-token-generate", () =>
  jest.fn().mockReturnValue(mockToken)
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let knex: any;

beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(currentTime);

  knex = Knex(knexConfig.test);
  Model.knex(knex);
  await knex.migrate.latest();
});

afterEach(async () => {
  jest.useRealTimers();

  await knex.migrate.rollback();
  await knex.destroy();
});
