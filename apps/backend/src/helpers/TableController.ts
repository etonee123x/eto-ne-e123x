import { _throw } from '@etonee123x/shared/utils/_throw';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import createHttpError from 'http-errors';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isNil } from '@etonee123x/shared';

const tableDatabasePath = process.env.DATABASE_PATH ?? throwError('DATABASE_PATH is not defined');

interface Meta {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export class TableController<
  const Entity extends object,
  const Row extends Omit<Entity, '_meta'> & {
    _meta: Meta;
  } = Omit<Entity, '_meta'> & {
    _meta: Meta;
  },
> {
  protected readonly absolutePath: string;
  constructor(tableTitle: string) {
    this.absolutePath = path.join(tableDatabasePath, `${tableTitle}.json`);

    if (!existsSync(this.absolutePath)) {
      mkdirSync(path.dirname(this.absolutePath), { recursive: true });
      writeFileSync(this.absolutePath, JSON.stringify([]));
    }
  }

  read(): Array<Row> {
    return jsonParse.unsafe<Array<Row>>(readFileSync(this.absolutePath, { encoding: 'utf8' }));
  }

  readRowById(id: string, rows: Array<Row> = this.read()): Row {
    return (
      rows.find((row) => {
        return row._meta.id === id;
      }) ?? _throw(createHttpError(404))
    );
  }

  writeEntityOrRow(id: string | undefined, entityOrRow: Entity | Row): Row {
    const row = {
      ...entityOrRow,
      _meta: {
        id: '_meta' in entityOrRow ? entityOrRow._meta.id : TableController.generateId(),
        createdAt: '_meta' in entityOrRow ? entityOrRow._meta.createdAt : TableController.getCreatedAt(),
        updatedAt: TableController.getUpdatedAt(),
      },
    } as Row;

    const rows = this.read();

    if (isNil(id)) {
      writeFileSync(this.absolutePath, JSON.stringify([row, ...this.read()]));

      return row;
    }

    const existingRowIndex = rows.findIndex((row) => {
      return row._meta.id === id;
    });

    if (existingRowIndex === -1) {
      throw createHttpError(404);
    }

    writeFileSync(this.absolutePath, JSON.stringify(rows.toSpliced(existingRowIndex, 1, row)));

    return row;
  }

  deleteRowById(id: string): Row {
    const rows = this.read();
    const row = this.readRowById(id, rows);

    const updatedRows = rows.filter((row) => {
      return row._meta.id !== id;
    });

    writeFileSync(this.absolutePath, JSON.stringify(updatedRows));

    return row;
  }

  private static getUpdatedAt(): number {
    return Date.now();
  }

  private static getCreatedAt(): number {
    return Date.now();
  }

  private static generateId(): string {
    return randomUUID();
  }
}
