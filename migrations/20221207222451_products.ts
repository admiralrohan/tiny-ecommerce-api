import { Knex } from "knex";

const tableName = "products";

export function up(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.createTable(tableName, (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("name");
    table.string("price");
    table.boolean("isActive"); // User can temporarily stop selling some product
    table.datetime("createdAt");
  });
}

export function down(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.dropTableIfExists(tableName);
}
