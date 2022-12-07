## Tiny e-commerce API

REST API for e-commerce marketplace

Tech Used: NodeJS, Postgres

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
