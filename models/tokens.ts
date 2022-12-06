import { Model } from "objection";

export default class Tokens extends Model {
  static tableName = "tokens";

  id!: number;
  userId!: number;
  token!: string;
  loggedInAt!: Date;
  loggedOutAt!: Date;
}
