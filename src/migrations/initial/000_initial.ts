import { DataTypes } from "sequelize";
import { MigrationAction } from "../../interface";

export const up: MigrationAction = async ({ context: queryInterface }) => {
  queryInterface.createTable("user_basic", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    login_name: {
      type: DataTypes.STRING(100),
    },
    nick_name: {
      type: DataTypes.STRING(100),
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
};
