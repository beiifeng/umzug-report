import { MigrationSet } from "../interface";

const setup: MigrationSet = {
  description: "The entry config of the umzug migrations.",
  include: [
    {
      author: "Wang YiFei",
      description: "The db init script.",
      file: "./initial/000_initial.js",
      dialect: "*",
      type: "js",
    },
    {
      author: "Wang YiFei",
      description: "The db init script.",
      file: "./initial/001_initial.js",
      dialect: "*",
      type: "js",
    },
    {
      author: "Wang YiFei",
      description: "The db init script.",
      file: "./initial/s001_user_role.sql",
      dialect: "*",
      type: "sql",
    },
  ],
};

export { setup };
