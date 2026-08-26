import type { FsDatabaseFile, Meta } from '@/infrastructure/fs-database-file';

export class FsDatabaseRepo<
  const Entity extends object,
  const Row extends Omit<Entity, '_meta'> & {
    _meta: Meta;
  } = Omit<Entity, '_meta'> & {
    _meta: Meta;
  },
> {
  protected readonly fsDatabaseFile: FsDatabaseFile<Entity, Row>;

  constructor(parameters: { fsDatabaseFile: FsDatabaseFile<Entity, Row> }) {
    this.fsDatabaseFile = parameters.fsDatabaseFile;
  }
}
