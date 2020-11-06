/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, filename);

    const data = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const result = this.parseCsv(data);

    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    for (const row of result) {
      const { title, type, value, category } = row;

      const transaction = await createTransaction.execute({
        title,
        type,
        value,
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }

  private parseCsv(csv: string): any[] {
    const rows = csv.trim().split('\n');

    const headers = rows[0].split(', ');

    const array = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(', ');
      const obj: any = {};

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = cols[j];
      }

      if (Object.keys(obj).length > 0) {
        array.push(obj);
      }
    }

    return array;
  }
}

export default ImportTransactionsService;
