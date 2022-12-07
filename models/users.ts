import { Model } from "objection";

export default class Users extends Model {
  static tableName = "users";

  id!: number;
  username!: string;
  email!: string;
  password!: string;
  type!: string;
  createdAt!: Date;
  catalog!: number[];

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        // It would automatically serialized and deserialized by ObjectionJs
        catalog: { type: "array" },
      },
    };
  }
}
