import { readFileSync } from "fs";
import { basename } from "path";
import { Sequelize } from "sequelize";
import { MigrationParams, RunnableMigration, Umzug } from "umzug";
import {
  CustomMeta,
  DialectType,
  MigrationAction,
  MigrationItem,
  UmzugContext,
} from "./interface";
import { setup } from "./migrations/setup";
import { OYetStorage } from "./oyetstorage";
import { isArray, resolveBasePath } from "./utils";

const isDialectMatched = (item: MigrationItem, dialect: DialectType) => {
  if (isArray(item.dialect)) {
    return item.dialect.includes(dialect);
  }
  return item.dialect === dialect || item.dialect === "*";
};

const toSqlMigration = (
  item: MigrationItem,
  metaMap: Record<string, CustomMeta>
): RunnableMigration<UmzugContext> => {
  metaMap[item.file] = { author: item.author };
  return {
    path: item.file,
    // you can use `x.file` also.
    name: basename(item.file),
    up: async ({ context }: MigrationParams<UmzugContext>) => {
      const sql = readFileSync(
        resolveBasePath("./migrations", item.file),
        "utf8"
      );
      context.queryInterface.sequelize.transaction(async (tran) => {
        // FIXME only execute one raw;
        return await context.queryInterface.sequelize.query(sql, {
          type: "RAW",
          transaction: tran,
        });
      });
    },
  };
};

const toJsMigration = (
  item: MigrationItem,
  metaMap: Record<string, CustomMeta>
): RunnableMigration<UmzugContext> => {
  metaMap[item.file] = { author: item.author };
  return {
    path: item.file,
    // you can use `x.file` also.
    name: basename(item.file),
    up: async ({ name, context }: MigrationParams<UmzugContext>) => {
      const { up } = (await import(
        resolveBasePath("./migrations", item.file)
      )) as { up: MigrationAction };
      return up({ name, context: context.queryInterface });
    },
  };
};

export const migration = async (sequelize: Sequelize) => {
  const dialect = sequelize.getDialect() as DialectType;
  const currentDialectItems = setup.include.filter((x) =>
    isDialectMatched(x, dialect)
  );

  const metaMap: Record<string, CustomMeta> = {};
  const migrations: RunnableMigration<UmzugContext>[] = currentDialectItems
    .map((item) => {
      switch (item.type) {
        case "sql":
          return toSqlMigration(item, metaMap);
        case "js":
          return toJsMigration(item, metaMap);
        default:
          return null;
      }
    })
    .filter((x) => x);
  const umzug = new Umzug({
    migrations: migrations,
    context: { queryInterface: sequelize.getQueryInterface(), meta: metaMap },
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
