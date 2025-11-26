import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl =
  nodeEnv === 'production'
    ? process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
    : process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(`DATABASE_URL_${nodeEnv.toUpperCase()} is not defined`);
}

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
};
