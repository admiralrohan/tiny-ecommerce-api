import { Model } from "objection";

export default class Users extends Model {
  static tableName = "users";

  id!: number;
  username!: string;
  email!: string;
  password!: string;
  type!: string;
  createdAt!: Date;
}
