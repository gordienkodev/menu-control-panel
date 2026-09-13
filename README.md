This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Current architecture

`src/app/page.tsx` and `src/app/layout.tsx` remain Server Components. The layout
wraps the application in the client-side `Providers` boundary, which owns the
TanStack Query client.

The menu data and filter flow is:

```text
URL search params
  -> Page (Server Component): parse and normalize shop/status
  -> Filters + StopListTable (Client Components)
  -> TanStack Query configuration
  -> menu API transport
  -> GET /api/menu-items
  -> server-only in-memory store
```

Server state stays in the TanStack Query cache. UI components do not call
`fetch` or import the server store directly. The URL is the only source of truth
for `shop` and `status`: filter controls update it with client-side navigation,
while the table filters the cached full menu without changing the query key or
requesting the API again.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

- [Menu Control Panel Link](https://menu-control-panel.vercel.app/)
