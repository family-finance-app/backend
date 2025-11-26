import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { TransactionType } from '../src/generated/prisma/enums.js';

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
    icon: 'shopping-basket',
    color: '#2E7D32',
  },
  {
    name: 'Rent/Mortgage',
    type: TransactionType.EXPENSE,
    icon: 'home',
    color: '#6A1B9A',
  },
  {
    name: 'Utility Bills',
    type: TransactionType.EXPENSE,
    icon: 'bolt',
    color: '#F57F17',
  },
  {
    name: 'Electricity',
    type: TransactionType.EXPENSE,
    icon: 'bolt',
    color: '#F9A825',
  },
  {
    name: 'Water',
    type: TransactionType.EXPENSE,
    icon: 'droplet',
    color: '#0288D1',
  },
  {
    name: 'Gas',
    type: TransactionType.EXPENSE,
    icon: 'flame',
    color: '#C62828',
  },
  {
    name: 'Internet',
    type: TransactionType.EXPENSE,
    icon: 'wifi',
    color: '#1565C0',
  },
  {
    name: 'Mobile Phone',
    type: TransactionType.EXPENSE,
    icon: 'phone',
    color: '#1E88E5',
  },
  {
    name: 'TV/Streaming',
    type: TransactionType.EXPENSE,
    icon: 'tv',
    color: '#5E35B1',
  },
  {
    name: 'Transportation',
    type: TransactionType.EXPENSE,
    icon: 'bus',
    color: '#00695C',
  },
  {
    name: 'Fuel',
    type: TransactionType.EXPENSE,
    icon: 'gas-pump',
    color: '#8D6E63',
  },
  {
    name: 'Parking',
    type: TransactionType.EXPENSE,
    icon: 'parking',
    color: '#37474F',
  },
  {
    name: 'Taxi/Rideshare',
    type: TransactionType.EXPENSE,
    icon: 'car',
    color: '#455A64',
  },
  {
    name: 'Car Maintenance',
    type: TransactionType.EXPENSE,
    icon: 'tools',
    color: '#546E7A',
  },
  {
    name: 'Insurance',
    type: TransactionType.EXPENSE,
    icon: 'shield',
    color: '#283593',
  },
  {
    name: 'Health Insurance',
    type: TransactionType.EXPENSE,
    icon: 'shield-heart',
    color: '#D32F2F',
  },
  {
    name: 'Medical',
    type: TransactionType.EXPENSE,
    icon: 'stethoscope',
    color: '#C2185B',
  },
  {
    name: 'Pharmacy',
    type: TransactionType.EXPENSE,
    icon: 'capsules',
    color: '#AD1457',
  },
  {
    name: 'Dentist',
    type: TransactionType.EXPENSE,
    icon: 'tooth',
    color: '#8E24AA',
  },
  {
    name: 'Education',
    type: TransactionType.EXPENSE,
    icon: 'book',
    color: '#1976D2',
  },
  {
    name: 'Tuition',
    type: TransactionType.EXPENSE,
    icon: 'graduation-cap',
    color: '#1565C0',
  },
  {
    name: 'Courses',
    type: TransactionType.EXPENSE,
    icon: 'chalkboard-teacher',
    color: '#0277BD',
  },
  {
    name: 'Childcare',
    type: TransactionType.EXPENSE,
    icon: 'baby',
    color: '#7B1FA2',
  },
  {
    name: 'Pets',
    type: TransactionType.EXPENSE,
    icon: 'paw',
    color: '#5D4037',
  },
  {
    name: 'Pet Food',
    type: TransactionType.EXPENSE,
    icon: 'bone',
    color: '#795548',
  },
  {
    name: 'Pet Care',
    type: TransactionType.EXPENSE,
    icon: 'syringe',
    color: '#6D4C41',
  },
  {
    name: 'Household',
    type: TransactionType.EXPENSE,
    icon: 'broom',
    color: '#2E7D32',
  },
  {
    name: 'Home Maintenance',
    type: TransactionType.EXPENSE,
    icon: 'tools',
    color: '#388E3C',
  },
  {
    name: 'Home Improvement',
    type: TransactionType.EXPENSE,
    icon: 'hammer',
    color: '#43A047',
  },
  {
    name: 'Furniture',
    type: TransactionType.EXPENSE,
    icon: 'couch',
    color: '#689F38',
  },
  {
    name: 'Appliances',
    type: TransactionType.EXPENSE,
    icon: 'blender',
    color: '#7CB342',
  },
  {
    name: 'Personal Care',
    type: TransactionType.EXPENSE,
    icon: 'spa',
    color: '#00897B',
  },
  {
    name: 'Hair & Beauty',
    type: TransactionType.EXPENSE,
    icon: 'scissors',
    color: '#26A69A',
  },
  {
    name: 'Clothing',
    type: TransactionType.EXPENSE,
    icon: 'tshirt',
    color: '#00796B',
  },
  {
    name: 'Dining Out',
    type: TransactionType.EXPENSE,
    icon: 'utensils',
    color: '#EF6C00',
  },
  {
    name: 'Restaurants',
    type: TransactionType.EXPENSE,
    icon: 'utensils',
    color: '#FB8C00',
  },
  {
    name: 'Cafes & Coffee',
    type: TransactionType.EXPENSE,
    icon: 'coffee',
    color: '#6D4C41',
  },
  {
    name: 'Entertainment',
    type: TransactionType.EXPENSE,
    icon: 'film',
    color: '#8E24AA',
  },
  {
    name: 'Movies',
    type: TransactionType.EXPENSE,
    icon: 'film',
    color: '#7B1FA2',
  },
  {
    name: 'Music',
    type: TransactionType.EXPENSE,
    icon: 'music',
    color: '#512DA8',
  },
  {
    name: 'Games',
    type: TransactionType.EXPENSE,
    icon: 'gamepad',
    color: '#4527A0',
  },
  {
    name: 'Sports & Fitness',
    type: TransactionType.EXPENSE,
    icon: 'dumbbell',
    color: '#C0CA33',
  },
  {
    name: 'Gym',
    type: TransactionType.EXPENSE,
    icon: 'dumbbell',
    color: '#9E9D24',
  },
  {
    name: 'Subscriptions',
    type: TransactionType.EXPENSE,
    icon: 'repeat',
    color: '#5E35B1',
  },
  {
    name: 'Travel',
    type: TransactionType.EXPENSE,
    icon: 'plane',
    color: '#1976D2',
  },
  {
    name: 'Vacation',
    type: TransactionType.EXPENSE,
    icon: 'umbrella-beach',
    color: '#039BE5',
  },
  {
    name: 'Hotels',
    type: TransactionType.EXPENSE,
    icon: 'bed',
    color: '#0288D1',
  },
  {
    name: 'Flights',
    type: TransactionType.EXPENSE,
    icon: 'plane',
    color: '#0277BD',
  },
  {
    name: 'Gifts & Donations',
    type: TransactionType.EXPENSE,
    icon: 'gift',
    color: '#AB47BC',
  },
  {
    name: 'Taxes',
    type: TransactionType.EXPENSE,
    icon: 'file-invoice-dollar',
    color: '#C62828',
  },
  {
    name: 'Fees',
    type: TransactionType.EXPENSE,
    icon: 'receipt',
    color: '#D84315',
  },
  {
    name: 'Bank Fees',
    type: TransactionType.EXPENSE,
    icon: 'university',
    color: '#6D4C41',
  },
  {
    name: 'Electronics',
    type: TransactionType.EXPENSE,
    icon: 'tablet-alt',
    color: '#455A64',
  },
];

const incomeCategories: SeedCategory[] = [
  {
    name: 'Salary',
    type: TransactionType.INCOME,
    icon: 'briefcase',
    color: '#2E7D32',
  },
  {
    name: 'Bonus',
    type: TransactionType.INCOME,
    icon: 'award',
    color: '#558B2F',
  },
  {
    name: 'Freelance',
    type: TransactionType.INCOME,
    icon: 'laptop-code',
    color: '#1B5E20',
  },
  {
    name: 'Investment Income',
    type: TransactionType.INCOME,
    icon: 'chart-line',
    color: '#00695C',
  },
  {
    name: 'Dividends',
    type: TransactionType.INCOME,
    icon: 'coins',
    color: '#00897B',
  },
  {
    name: 'Interest',
    type: TransactionType.INCOME,
    icon: 'percent',
    color: '#00796B',
  },
  {
    name: 'Rental Income',
    type: TransactionType.INCOME,
    icon: 'building',
    color: '#1565C0',
  },
  {
    name: 'Refunds',
    type: TransactionType.INCOME,
    icon: 'undo',
    color: '#5E35B1',
  },
  {
    name: 'Gifts',
    type: TransactionType.INCOME,
    icon: 'gift',
    color: '#8E24AA',
  },
  {
    name: 'Reimbursement',
    type: TransactionType.INCOME,
    icon: 'file-invoice',
    color: '#6A1B9A',
  },
  {
    name: 'Pension',
    type: TransactionType.INCOME,
    icon: 'user-check',
    color: '#283593',
  },
  {
    name: 'Social Benefits',
    type: TransactionType.INCOME,
    icon: 'hand-holding-heart',
    color: '#1565C0',
  },
  {
    name: 'Other Income',
    type: TransactionType.INCOME,
    icon: 'plus-circle',
    color: '#424242',
  },
];

async function upsertCategories(categories: SeedCategory[]) {
  for (const c of categories) {
    const exists = await prisma.category.findFirst({
      where: { name: c.name, type: c.type },
      select: { id: true },
    });
    if (!exists) {
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
