import { MigrationItem } from "../umzug";

type MigrationSet = {
  description?: string;
  include: MigrationItem[];
};

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
  ],
};

export { setup };
