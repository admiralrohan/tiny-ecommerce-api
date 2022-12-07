import { Model } from "objection";

export default class Tokens extends Model {
  static tableName = "tokens";

  /** Token Id doesn't matter for any verifications, just used for Primary key,
   * Maybe consider using actual token as primary key.  */
  id!: number;
  userId!: number;
  token!: string;
  loggedInAt!: Date;
  loggedOutAt!: Date;
}
