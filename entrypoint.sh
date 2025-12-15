#!/bin/sh

node run migrate:prod

node run seed

node dist/main.js
