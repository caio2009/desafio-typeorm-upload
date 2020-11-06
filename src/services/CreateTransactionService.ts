import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepo = getRepository(Category);
    const transactionRepo = getCustomRepository(TransactionRepository);

    const balance = await transactionRepo.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        "Invalid outcome value. Outcome can't be greater than balance.",
      );
    }

    let findedCategory = (await categoryRepo.findOne({
      where: { title: category },
    })) as Category;

    // Se categoria não foi encontrada, crie uma nova
    if (!findedCategory) {
      const newCategory = categoryRepo.create({ title: category });

      findedCategory = await categoryRepo.save(newCategory);
    }

    const transaction = transactionRepo.create({
      title,
      value,
      type,
      category_id: findedCategory.id,
    });

    await transactionRepo.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
