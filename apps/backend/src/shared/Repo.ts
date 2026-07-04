import type { Pool } from 'pg';

export class Repo {
  protected readonly pool: Pool;

  constructor(parameters: { pool: Pool }) {
    this.pool = parameters.pool;
  }
}
