import { DataTypes } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  queryInterface.createTable("user_basic", {
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
