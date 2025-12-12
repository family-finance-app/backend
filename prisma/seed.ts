import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client.js';
import { TransactionType } from '../prisma/generated/enums.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type SeedCategory = {
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
};

const expenseCategories: SeedCategory[] = [
  {
    name: 'Groceries',
    type: TransactionType.EXPENSE,
    icon: 'ri-bread-line',
    color: '#2E7D32',
  },
  {
    name: 'Rent/Mortgage',
    type: TransactionType.EXPENSE,
    icon: 'ri-home-4-line',
    color: '#6A1B9A',
  },
  {
    name: 'Utility Bills',
    type: TransactionType.EXPENSE,
    icon: 'ri-water-flash-line',
    color: '#F57F17',
  },
  {
    name: 'Electricity',
    type: TransactionType.EXPENSE,
    icon: 'ri-water-flash-line',
    color: '#F9A825',
  },
  {
    name: 'Water',
    type: TransactionType.EXPENSE,
    icon: 'ri-water-flash-line',
    color: '#0288D1',
  },
  {
    name: 'Gas',
    type: TransactionType.EXPENSE,
    icon: 'ri-water-flash-line',
    color: '#C62828',
  },
  {
    name: 'Internet',
    type: TransactionType.EXPENSE,
    icon: 'ri-home-wifi-line',
    color: '#1565C0',
  },
  {
    name: 'Mobile Phone',
    type: TransactionType.EXPENSE,
    icon: 'ri-phone-line',
    color: '#1E88E5',
  },
  {
    name: 'TV/Streaming',
    type: TransactionType.EXPENSE,
    icon: 'ri-tv-2-line',
    color: '#5E35B1',
  },
  {
    name: 'Transportation',
    type: TransactionType.EXPENSE,
    icon: 'ri-bus-line',
    color: '#00695C',
  },
  {
    name: 'Fuel',
    type: TransactionType.EXPENSE,
    icon: 'ri-gas-station-line',
    color: '#8D6E63',
  },
  {
    name: 'Parking',
    type: TransactionType.EXPENSE,
    icon: 'ri-parking-box-line',
    color: '#37474F',
  },
  {
    name: 'Taxi/Rideshare',
    type: TransactionType.EXPENSE,
    icon: 'ri-taxi-line',
    color: '#455A64',
  },
  {
    name: 'Car Maintenance',
    type: TransactionType.EXPENSE,
    icon: 'ri-wrench-line',
    color: '#546E7A',
  },
  {
    name: 'Insurance',
    type: TransactionType.EXPENSE,
    icon: 'ri-pass-valid-line',
    color: '#283593',
  },
  {
    name: 'Health Insurance',
    type: TransactionType.EXPENSE,
    icon: 'ri-health-book-line',
    color: '#D32F2F',
  },
  {
    name: 'Medical',
    type: TransactionType.EXPENSE,
    icon: 'ri-stethoscope-line',
    color: '#C2185B',
  },
  {
    name: 'Pharmacy',
    type: TransactionType.EXPENSE,
    icon: 'ri-capsule-line',
    color: '#AD1457',
  },
  {
    name: 'Dentist',
    type: TransactionType.EXPENSE,
    icon: 'ri-stethoscope-line',
    color: '#8E24AA',
  },
  {
    name: 'Education',
    type: TransactionType.EXPENSE,
    icon: 'ri-school-line',
    color: '#1976D2',
  },
  {
    name: 'Tuition',
    type: TransactionType.EXPENSE,
    icon: 'ri-school-line',
    color: '#1565C0',
  },
  {
    name: 'Courses',
    type: TransactionType.EXPENSE,
    icon: 'ri-school-line',
    color: '#0277BD',
  },
  {
    name: 'Childcare',
    type: TransactionType.EXPENSE,
    icon: 'ri-parent-line',
    color: '#7B1FA2',
  },
  {
    name: 'Pets',
    type: TransactionType.EXPENSE,
    icon: 'ri-parent-line',
    color: '#5D4037',
  },
  {
    name: 'Pet Food',
    type: TransactionType.EXPENSE,
    icon: 'ri-bread-line',
    color: '#795548',
  },
  {
    name: 'Pet Care',
    type: TransactionType.EXPENSE,
    icon: 'ri-parent-line',
    color: '#6D4C41',
  },
  {
    name: 'Household',
    type: TransactionType.EXPENSE,
    icon: 'ri-tools-fill',
    color: '#2E7D32',
  },
  {
    name: 'Home Maintenance',
    type: TransactionType.EXPENSE,
    icon: 'ri-tools-fill',
    color: '#388E3C',
  },
  {
    name: 'Home Improvement',
    type: TransactionType.EXPENSE,
    icon: 'ri-tools-fill',
    color: '#43A047',
  },
  {
    name: 'Furniture',
    type: TransactionType.EXPENSE,
    icon: 'ri-sofa-line',
    color: '#689F38',
  },
  {
    name: 'Appliances',
    type: TransactionType.EXPENSE,
    icon: 'ri-fridge-line',
    color: '#7CB342',
  },
  {
    name: 'Personal Care',
    type: TransactionType.EXPENSE,
    icon: 'ri-heart-line',
    color: '#00897B',
  },
  {
    name: 'Hair & Beauty',
    type: TransactionType.EXPENSE,
    icon: 'ri-scissors-line',
    color: '#26A69A',
  },
  {
    name: 'Clothing',
    type: TransactionType.EXPENSE,
    icon: 'ri-shirt-line',
    color: '#00796B',
  },
  {
    name: 'Dining Out',
    type: TransactionType.EXPENSE,
    icon: 'ri-restaurant-line',
    color: '#EF6C00',
  },
  {
    name: 'Restaurants',
    type: TransactionType.EXPENSE,
    icon: 'ri-restaurant-line',
    color: '#FB8C00',
  },
  {
    name: 'Cafes & Coffee',
    type: TransactionType.EXPENSE,
    icon: 'ri-restaurant-line',
    color: '#6D4C41',
  },
  {
    name: 'Entertainment',
    type: TransactionType.EXPENSE,
    icon: 'ri-film-line',
    color: '#8E24AA',
  },
  {
    name: 'Movies',
    type: TransactionType.EXPENSE,
    icon: 'ri-film-line',
    color: '#7B1FA2',
  },
  {
    name: 'Music',
    type: TransactionType.EXPENSE,
    icon: 'ri-spotify-line',
    color: '#512DA8',
  },
  {
    name: 'Games',
    type: TransactionType.EXPENSE,
    icon: 'ri-steam-fill',
    color: '#4527A0',
  },
  {
    name: 'Sports & Fitness',
    type: TransactionType.EXPENSE,
    icon: 'ri-basketball-line',
    color: '#C0CA33',
  },
  {
    name: 'Gym',
    type: TransactionType.EXPENSE,
    icon: 'ri-basketball-line',
    color: '#9E9D24',
  },
  {
    name: 'Subscriptions',
    type: TransactionType.EXPENSE,
    icon: 'ri-patreon-line',
    color: '#5E35B1',
  },
  {
    name: 'Travel',
    type: TransactionType.EXPENSE,
    icon: 'ri-plane-line',
    color: '#1976D2',
  },
  {
    name: 'Vacation',
    type: TransactionType.EXPENSE,
    icon: 'ri-plane-line',
    color: '#039BE5',
  },
  {
    name: 'Hotels',
    type: TransactionType.EXPENSE,
    icon: 'ri-hotel-bed-line',
    color: '#0288D1',
  },
  {
    name: 'Flights',
    type: TransactionType.EXPENSE,
    icon: 'ri-plane-line',
    color: '#0277BD',
  },
  {
    name: 'Gifts & Donations',
    type: TransactionType.EXPENSE,
    icon: 'ri-gift-line',
    color: '#AB47BC',
  },
  {
    name: 'Taxes',
    type: TransactionType.EXPENSE,
    icon: 'ri-wallet-3-line',
    color: '#C62828',
  },
  {
    name: 'Fees',
    type: TransactionType.EXPENSE,
    icon: 'ri-wallet-3-line',
    color: '#D84315',
  },
  {
    name: 'Bank Fees',
    type: TransactionType.EXPENSE,
    icon: 'ri-wallet-3-line',
    color: '#6D4C41',
  },
  {
    name: 'Electronics',
    type: TransactionType.EXPENSE,
    icon: 'ri-tablet-line',
    color: '#455A64',
  },
];

const incomeCategories: SeedCategory[] = [
  {
    name: 'Salary',
    type: TransactionType.INCOME,
    icon: 'ri-hand-coin-line',
    color: '#2E7D32',
  },
  {
    name: 'Bonus',
    type: TransactionType.INCOME,
    icon: 'ri-hand-coin-line',
    color: '#558B2F',
  },
  {
    name: 'Freelance',
    type: TransactionType.INCOME,
    icon: 'ri-hand-coin-line',
    color: '#1B5E20',
  },
  {
    name: 'Investment Income',
    type: TransactionType.INCOME,
    icon: 'ri-funds-line',
    color: '#00695C',
  },
  {
    name: 'Dividends',
    type: TransactionType.INCOME,
    icon: 'ri-hand-coin-line',
    color: '#00897B',
  },
  {
    name: 'Interest',
    type: TransactionType.INCOME,
    icon: 'ri-funds-line',
    color: '#00796B',
  },
  {
    name: 'Rental Income',
    type: TransactionType.INCOME,
    icon: 'ri-hand-coin-line',
    color: '#1565C0',
  },
  {
    name: 'Refunds',
    type: TransactionType.INCOME,
    icon: 'ri-arrow-go-back-line',
    color: '#5E35B1',
  },
  {
    name: 'Gifts',
    type: TransactionType.INCOME,
    icon: 'ri-gift-line',
    color: '#8E24AA',
  },
  {
    name: 'Reimbursement',
    type: TransactionType.INCOME,
    icon: 'ri-arrow-go-back-line',
    color: '#6A1B9A',
  },
  {
    name: 'Pension',
    type: TransactionType.INCOME,
    icon: 'ri-bill-line',
    color: '#283593',
  },
  {
    name: 'Social Benefits',
    type: TransactionType.INCOME,
    icon: 'ri-hand-heart-fill',
    color: '#1565C0',
  },
  {
    name: 'Other Income',
    type: TransactionType.INCOME,
    icon: 'ri-hand-coin-line',
    color: '#424242',
  },
];

async function upsertCategories(categories: SeedCategory[]) {
  for (const c of categories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: c.name,
        type: c.type,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          icon: c.icon ?? null,
          color: c.color ?? null,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name: c.name,
          type: c.type,
          icon: c.icon ?? null,
          color: c.color ?? null,
        },
      });
    }
  }
}

async function main() {
  console.log('Seeding categories...');
  await upsertCategories(expenseCategories);
  await upsertCategories(incomeCategories);

  const count = await prisma.category.count();
  console.log(`Seeding done. Total categories in DB: ${count}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
