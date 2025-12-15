import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

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
