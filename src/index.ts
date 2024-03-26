import { Sequelize } from "sequelize";
import { prepareEnv, resolveBasePath } from "./utils";
import { migration } from "./umzug";

const run = async () => {
  prepareEnv(__dirname);
  const storage = resolveBasePath("../data/my-data.sqlite");
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: storage,
    define: {
      freezeTableName: true,
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    logging: (sql) => console.debug(sql),
  });

  await migration(sequelize);
};

run();
