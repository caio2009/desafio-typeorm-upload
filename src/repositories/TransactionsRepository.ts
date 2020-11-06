import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomeTransactionsValue = transactions
      .filter(transaction => transaction.type === 'income')
      .map(transaction => transaction.value);

    const outcomeTransactionsValue = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(transaction => transaction.value);

    const incomeValue = incomeTransactionsValue.reduce(
      (amount, curr) => amount + curr,
      0,
    );

    const outcomeValue = outcomeTransactionsValue.reduce(
      (amount, curr) => amount + curr,
      0,
    );

    return {
      income: Number(incomeValue),
      outcome: Number(outcomeValue),
      total: incomeValue - outcomeValue,
    };
  }
}

export default TransactionsRepository;
