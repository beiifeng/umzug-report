const path = require("path");
const fs = require("fs");
const glob = require("glob");

const cwd = process.cwd();
const [, , src = "src", files = "**/*.sql", dest = "dist"] = process.argv;

const matchFiles = glob.globSync(
  files
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x),
  {
    cwd: path.join(cwd, src),
    absolute: false,
  }
);

matchFiles.forEach((file) => {
  fs.copyFileSync(path.join(cwd, src, file), path.join(cwd, dest, file));
  console.log(
    'Copy file from "%s" to "%s".',
    path.join(src, file),
    path.join(dest, file)
  );
});
