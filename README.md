## Tiny e-commerce API

REST API for e-commerce marketplace

Tech Used: NodeJS, Postgres

Check list of available APIs here https://documenter.getpostman.com/view/3660544/2s8YzQX4NB

Postgres installation guide https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-20-04

## Run the project

After cloning the project, install the packages:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

## Other commands

Run test cases `npm t`

Run tests and watch live changes `npm run test:watch`

Check for migrations `knex migrate:list --env dev` (Available DB envs: `dev`, `prod`, `test`)

Run all pending migrations `knex migrate:latest --env dev`

Rollback last migration `knex migrate:rollback`

## Some assumptions

- API response format `{ success: boolean, message: string, data?: Object, error?: string }`
- An user (means an unique email ID) can register as `buyer` or `seller`.
- `username` isn't unique at this moment.
- User can sell products and also buy products. But for that need to register twice as different roles.
- Assuming the user won't buy from themselves. If `buyer.email == seller.email`, reject the order.
- Don't have any separate Entity for `catalog` as we can only have one catalog per seller at a time. So keeping the list of products along with `user` entity to make it simple.
  - The downside is there are no DB-level check for whether the catalog products belong to the seller i.e the seller can sell products from other seller, or non-existent products. But there are checks at API controller level against that.
- For now no option to delete products. User can deactivate it.
- No API for completing order now, out of scope.
