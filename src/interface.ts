import { QueryInterface } from "sequelize";
import { MigrationParams } from "umzug";

export type MigrationAction = (
  params: MigrationParams<QueryInterface>
) => Promise<unknown>;

export type CustomMeta = {
  author: string;
};

export type UmzugContext = {
  queryInterface: QueryInterface;
  meta: Record<string, CustomMeta>;
};

export type DialectType = "sqlite" | "mysql" | "postgresql" | "*";
export type MigrationType = "sql" | "js";

export type MigrationItem = {
  author: string;
  description?: string;
  file: string;
  dialect: DialectType | DialectType[];
  type: MigrationType;
};

export type MigrationSet = {
  description?: string;
  include: MigrationItem[];
};
