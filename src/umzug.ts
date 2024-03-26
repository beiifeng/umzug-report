import { setup } from "./migrations/setup";
import { isArray, resolveBasePath } from "./utils";
import { readFileSync } from "fs";
import { basename, join } from "path";
import { QueryInterface, Sequelize } from "sequelize";
import { RunnableMigration, Umzug } from "umzug";
import { OYetStorage } from "./oyetstorage";

export type SupportedDialect = "*" | "sqlite" | "mysql";
export type MigrationType = "sql" | "js";
export type MigrationItem = {
  author: string;
  description?: string;
  file: string;
  dialect: SupportedDialect | SupportedDialect[];
  type: MigrationType;
};

// TODO What we want:
// declare module "umzug" {
//   interface MigrationMeta {
//     author: string;
//   }
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   interface MigrationParams<T> {
//     author: string;
//   }
// }

const isDialectMatched = (item: MigrationItem, dialect: SupportedDialect) => {
  if (isArray(item.dialect)) {
    return item.dialect.includes(dialect);
  }
  return item.dialect === dialect || item.dialect === "*";
};

export const migration = async (sequelize: Sequelize) => {
  const dialect = sequelize.getDialect() as SupportedDialect;
  const currentDialectItems = setup.include.filter((x) =>
    isDialectMatched(x, dialect)
  );
  const sqlItems = currentDialectItems.filter((x) => x.type === "sql");
  const jsItems = currentDialectItems.filter((x) => x.type === "js");
  const sqlMigrations: RunnableMigration<QueryInterface>[] = sqlItems.map(
    (x) => ({
      // TODO here we want add author meta.
      author: x.author,
      name: basename(x.file),
      up: async () => {
        const sql = readFileSync(
          join(resolveBasePath("./migrations"), x.file)
        ).toString();
        await sequelize.query(sql);
      },
    })
  );
  const jsMigrations: RunnableMigration<QueryInterface>[] = jsItems.map(
    (x) => ({
      // TODO here we want add author meta.
      author: x.author,
      name: basename(x.file),
      up: async (params) => {
        const { up } = await import(
          join(resolveBasePath("./migrations"), x.file)
        );
        return up(params);
      },
    })
  );
  const umzug = new Umzug({
    migrations: [...sqlMigrations, ...jsMigrations],
    context: sequelize.getQueryInterface(),
    storage: new OYetStorage({
      sequelize: sequelize,
      tableName: "sequelize_meta",
    }),
    logger: console,
  });

  console.debug("Database migration begin...");
  // Checks migrations and run them if they are not already applied. To keep
  // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
  // will be automatically created (if it doesn't exist already) and parsed.
  await umzug
    .up()
    .then(() => console.debug("Database migration successful!"))
    .catch((err) => {
      console.error("Database migration failed!", err);
      throw err;
    });
};
