import { Knex } from "knex";

const tableName = "users";

export function up(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.createTable(tableName, (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("username");
    table.string("email");
    table.string("password");
    table.string("type");
    table.datetime("createdAt");
  });
}

export function down(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.dropTableIfExists(tableName);
}
