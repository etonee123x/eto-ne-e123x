import type { Pool } from 'pg';

export class PgRepo {
  protected readonly pool: Pool;

  constructor(parameters: { pool: Pool }) {
    this.pool = parameters.pool;
  }
}
