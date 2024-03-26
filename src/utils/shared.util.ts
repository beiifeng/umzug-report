import { resolve } from "path";

export const resolveBasePath = (...args: string[]): string => {
  return resolve(process.env.BASE_PATH, ...args);
};

export const prepareEnv = (basePath: string): void => {
  if (!process.env.BASE_PATH) {
    process.env.BASE_PATH = basePath;
  }
};
