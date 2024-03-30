import { DataTypes } from "sequelize";
import { MigrationAction } from "../../interface";

export const up: MigrationAction = async ({ context: queryInterface }) => {
  queryInterface.createTable("role_basic", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  });
};
