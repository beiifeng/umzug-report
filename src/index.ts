import { Sequelize } from "sequelize";
import { migration } from "./umzug";
import { prepareEnv, resolveBasePath } from "./utils";

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
  await sequelize.close();
};

run();
