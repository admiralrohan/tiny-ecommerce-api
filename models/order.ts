import { Model } from "objection";

export default class Orders extends Model {
  static tableName = "orders";

  id!: number;
  buyerId!: number;
  sellerId!: number;
  productIds!: number[];
  createdAt!: Date;
  completedAt!: Date;

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        productIds: { type: "array" },
      },
    };
  }
}
