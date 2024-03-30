import { DataTypes } from "sequelize";
import { MigrationAction } from "../../interface";

export const up: MigrationAction = async ({ context: queryInterface }) => {
  queryInterface.createTable("user_role", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
  });
};
