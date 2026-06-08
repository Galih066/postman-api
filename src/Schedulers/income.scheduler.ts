import cron from 'node-cron';
import { addDefaultIncome } from '../Services/Expanses/income.services.js';

// Runs at 00:00 on the 1st of every month
export const startIncomeScheduler = () => {
    cron.schedule('0 0 1 * *', async () => {
        await addDefaultIncome();
    }, { timezone: 'UTC' });

    console.info('Income scheduler registered — runs on 1st of every month at 00:00 UTC');
};
