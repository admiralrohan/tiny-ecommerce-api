import { Knex } from "knex";

const tableName = "orders";

export function up(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.createTable(tableName, (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.integer("buyerId").references("id").inTable("users");
    table.integer("sellerId").references("id").inTable("users");
    table.string("productIds").defaultTo("[]");
    table.datetime("createdAt");
    table.datetime("completedAt");
  });
}

export function down(knex: Knex): Knex.SchemaBuilder {
  return knex.schema.dropTableIfExists(tableName);
}
