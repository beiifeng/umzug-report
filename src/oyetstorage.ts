/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2017 Sequelize contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as os from "node:os";
import type { MigrationParams, UmzugStorage } from "umzug";

/**
 * Minimal structure of a sequelize model, defined here to avoid a hard dependency.
 * The type expected is `import { Model } from 'sequelize'`
 */
export type ModelClass = {
  tableName: string;
  sequelize?: SequelizeType;
  getTableName(): string;
  sync(): Promise<void>;
  findAll(options?: Record<string, any>): Promise<any[]>;
  create(options: Record<string, any>): Promise<void>;
  destroy(options: Record<string, any>): Promise<void>;
};

/**
 * Minimal structure of a sequelize model, defined here to avoid a hard dependency.
 * The type expected is `import { Sequelize } from 'sequelize'`
 */
export type SequelizeType = {
  getQueryInterface(): any;
  isDefined(modelName: string): boolean;
  model(modelName: string): any;
  define(
    modelName: string,
    columns: Record<string, any>,
    options: Record<string, any>
  ): Record<string, any>;
};

type ModelTempInterface = ModelClass & Record<string, any>;

type ModelClassType = ModelClass &
  (new (values?: object, options?: any) => ModelTempInterface);

export type OYetStorageConstructorOptions = {
  /**
   * The configured instance of Sequelize. If omitted, it is inferred from the `model` option.
   */
  readonly sequelize: SequelizeType;

  /**
   * The name of the model.
   * @default 'SequelizeMeta'
   */
  readonly modelName?: string;

  /**
   * The name of the table. If omitted, defaults to the model name.
   */
  readonly tableName?: string;

  /**
   * Name of the schema under which the table is to be created.
   * @default undefined
   */
  readonly schema?: any;
};

export class OYetStorage implements UmzugStorage {
  public readonly sequelize: SequelizeType;
  public readonly columnType: string;
  public readonly timestamps: boolean;
  public readonly paranoid: boolean;
  public readonly modelName: string;
  public readonly tableName?: string;
  public readonly schema: any;
  public readonly model: ModelClassType;

  /**
   * Constructs Sequelize based storage. Migrations will be stored in a SequelizeMeta table using the given instance of Sequelize.
   * If a model is given, it will be used directly as the model for the SequelizeMeta table. Otherwise, it will be created automatically according to the given options.
   * If the table does not exist it will be created automatically upon the logging of the first migration.
   */
  constructor(options: OYetStorageConstructorOptions) {
    if (!options || !options.sequelize) {
      throw new Error('The "sequelize" storage option is required');
    }

    this.sequelize = options.sequelize;
    this.columnType = (this.sequelize.constructor as any).STRING;
    this.timestamps = true;
    this.paranoid = false;
    this.modelName = options.modelName ?? "SequelizeMeta";
    this.tableName = options.tableName;
    this.schema = options.schema;
    this.model = this.getModel();
  }

  getModel(): ModelClassType {
    if (this.sequelize.isDefined(this.modelName)) {
      return this.sequelize.model(this.modelName);
    }

    return this.sequelize.define(
      this.modelName,
      {
        name: {
          type: this.columnType,
          allowNull: false,
          unique: true,
          primaryKey: true,
          autoIncrement: false,
        },
        author: {
          type: (this.sequelize.constructor as any).STRING(200),
        },
        executor: {
          type: (this.sequelize.constructor as any).STRING(200),
        },
      },
      {
        tableName: this.tableName,
        schema: this.schema,
        timestamps: this.timestamps,
        paranoid: this.paranoid,
        updatedAt: false,
        charset: "utf8",
        collate: "utf8_unicode_ci",
      }
    ) as ModelClassType;
  }

  protected async syncModel() {
    await this.model.sync();
  }

  async logMigration(params: MigrationParams<unknown>): Promise<void> {
    await this.syncModel();
    await this.model.create({
      name: params.name,
      // TODO This was we want.
      author: (params as any).author,
      executor: `${os.hostname()}\\${os.userInfo().username}`,
    });
  }

  async unlogMigration({ name }: { name: string }): Promise<void> {
    await this.syncModel();
    await this.model.destroy({
      where: {
        name,
      },
    });
  }

  async executed(): Promise<string[]> {
    await this.syncModel();
    const migrations: any[] = await this.model.findAll({
      order: [["name", "ASC"]],
    });
    return migrations.map((migration) => {
      const name = migration.name;
      if (typeof name !== "string") {
        throw new TypeError(
          `Unexpected migration name type: expected string, got ${typeof name}`
        );
      }

      return name;
    });
  }
}
