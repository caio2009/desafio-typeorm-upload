import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepo = getCustomRepository(TransactionsRepository);

  // const transactions = await transactionRepo.find({
  //   select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
  //   relations: ['category'],
  // });

  const transactions = await transactionRepo.find();

  const balance = await transactionRepo.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.array('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    let transactions: Transaction[] = [];

    // const promises = (request.files as Express.Multer.File[]).map(
    //   async file => {
    //     const result = await importTransaction.execute({
    //       filename: file.filename,
    //     });

    //     transactions = transactions.concat(result);
    //   },
    // );

    // eslint-disable-next-line no-restricted-syntax
    for (const file of request.files as Express.Multer.File[]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await importTransaction.execute({
        filename: file.filename,
      });

      transactions = transactions.concat(result);
    }

    return response.json(transactions);
  },
);

export default transactionsRouter;
