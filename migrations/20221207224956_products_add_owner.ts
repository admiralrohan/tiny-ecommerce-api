import { Knex } from "knex";

const tableName = "products";

export function up(knex: Knex): Promise<void> {
  return knex.schema.table(tableName, (table) => {
    table.integer("ownerId").references("id").inTable("users");
  });
}

export function down(knex: Knex): Promise<void> {
  return knex.schema.table(tableName, (table) => {
    table.dropColumn("ownerId");
  });
}
