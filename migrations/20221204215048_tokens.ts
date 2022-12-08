import { Knex } from "knex";

const tableName = "tokens";

export function up(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.createTable(tableName, (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.integer("userId").references("id").inTable("users");
    table.string("token");
    table.datetime("loggedInAt");
    table.datetime("loggedOutAt");
  });
}

export function down(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.dropTableIfExists(tableName);
}
