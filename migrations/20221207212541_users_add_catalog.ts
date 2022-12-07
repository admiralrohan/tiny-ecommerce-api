import { Knex } from "knex";

const tableName = "users";

export function up(knex: Knex): Promise<void> {
  return knex.schema.table(tableName, (table) => {
    table.string("catalog").defaultTo("[]");
  });
}

export function down(knex: Knex): Promise<void> {
  return knex.schema.table(tableName, (table) => {
    table.dropColumn("catalog");
  });
}
