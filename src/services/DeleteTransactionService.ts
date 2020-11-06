import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepo = getCustomRepository(TransactionsRepository);

    const findedTransaction = await transactionRepo.findOne(id);

    if (!findedTransaction) {
      throw new AppError('Transaction not found!', 404);
    }

    await transactionRepo.delete(id);
  }
}

export default DeleteTransactionService;
