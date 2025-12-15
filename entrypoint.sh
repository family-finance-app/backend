#!/bin/sh

npx prisma generate
npx prisma migrate deploy

npx prisma db seed

node dist/main.js
