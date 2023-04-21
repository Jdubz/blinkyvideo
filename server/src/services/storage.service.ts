import { AsyncNedb } from 'nedb-async';
import path from 'path';

export class StorageService {
  db: AsyncNedb<{ type: string; data: any }>;

  constructor() {
    const filename = path.resolve('./data.db');
    this.db = new AsyncNedb({
      filename,
      autoload: true,
    });
  }

  public async index() {
    await this.db.asyncEnsureIndex({ fieldName: 'type' });
  }

  public async insert(type, data) {
    const doc = {
      data,
      type,
    };
    return await this.db.asyncInsert(doc);
  }

  public async find(type, data) {
    const query = {
      data,
      type,
    };
    return await this.db.asyncFind(query);
  }

  public async findOne(type, data) {
    const query = {
      data,
      type,
    };
    return await this.db.asyncFindOne(query);
  }

  public async update(type, query, data) {
    const doc = {
      data,
      type,
    };
    return await this.db.asyncUpdate(query, doc);
  }

  public async delete(type, query) {
    const doc = {
      type,
      ...query,
    };
    return await this.db.asyncRemove(doc);
  }
}
