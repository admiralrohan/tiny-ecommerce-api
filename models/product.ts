import { Model } from "objection";

export default class Products extends Model {
  static tableName = "products";

  id!: number;
  name!: string;
  price!: string;
  isActive!: boolean;
  createdAt!: Date;
}
