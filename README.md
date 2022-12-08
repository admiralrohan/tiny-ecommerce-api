## Tiny e-commerce API

REST API for e-commerce marketplace

Tech Used: NodeJS, Postgres

Check list of available APIs here https://documenter.getpostman.com/view/3660544/2s8YzQX4NB

## Run the project

After cloning the project, install the packages:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

## Some assumptions

- An user (means an unique email ID) can register as `buyer` or `seller`.
- `username` isn't unique at this moment.
- User can sell products and also buy products. But for that need to register twice as different roles.
- The user shouldn't intend to buy from products being sold from the `seller` account registered using same email ID. eg. If we have 2 seller a/c from email IDs I and II, and then if email ID I registers as buyer and tries to buy products then products being sold from email ID I would be hidden.
- API response format `{ success: boolean, message: string, data?: Object, error?: string }`
- Don't have any separate Entity for `catalog` as we can only have one catalog per seller at a time. So keeping the list of products along with `user` entity to make it simple.
  - The downside is there are no DB-level check for whether the catalog products belong to the seller i.e the seller can sell products from other seller, or non-existent products. But there are checks at API controller level against that.
- For now no option to delete products. User can deactivate it.
