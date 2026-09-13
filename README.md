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

The menu data, mutation, and filter flow is:

```text
URL search params
  -> Page (Server Component): parse and normalize shop/status
  -> Filters + StopListTable (Client Components)
  -> TanStack Query configuration
  -> menu API transport
  -> GET/POST /api/menu-items
  -> server-only in-memory store
```

Server state stays in the TanStack Query cache. UI components do not call
`fetch` or import the server store directly. The URL is the only source of truth
for `shop` and `status`: filter controls update it with client-side navigation,
while the table filters the cached full menu without changing the query key or
requesting the API again.

The stop-list side panel keeps only `selectedItemId` in a small Zustand store.
The selected `MenuItem` is resolved from the TanStack Query data, while React
Hook Form owns the form state. A shared Zod schema validates and produces the
`StopItemPayload`; submitting starts the stop mutation and closes the panel
immediately so the optimistic row update remains visible.

The server also exposes `POST /api/menu-items/:id/stop` and
`POST /api/menu-items/:id/resume`. Both handlers update the same server-only
in-memory store used by the GET endpoint, wait 600 ms, and simulate a failure
before mutation in roughly 20% of requests. The stop handler reuses the form's
Zod schema for request validation.

Stop/edit and resume use dedicated TanStack Query mutation hooks. Each hook
cancels the menu query, snapshots the full cached list, updates the affected
item immutably, rolls that item back from the snapshot on error, replaces it
with the server response on success, and invalidates the shared list query when
the last concurrent menu mutation settles. Pending mutation IDs disable only
the affected row. Because URL filters are applied to this same full-list cache,
optimistic status changes are reflected in filtered views without extra cache
entries or requests.

Mutation errors are exposed by the transport as regular `Error` instances. The
transport preserves readable server messages, translates the API's known error
messages, and supplies operation-specific fallbacks for unreadable responses or
network failures.
The mutation hooks roll back the affected cached item and publish an error toast
through the existing Zustand UI store. The reusable toast view is mounted next
to the table, so it remains visible when an optimistic status change temporarily
produces a filtered empty state. It uses an alert live region, can be dismissed,
and disappears automatically after five seconds. A per-item synchronous guard
also complements disabled pending controls to prevent rapid duplicate requests
before React can render the pending state.

The stop-list UI uses short Framer Motion transitions for the dialog backdrop,
side panel, toast, status badge, and filtered empty state. Each transition checks
the user's reduced-motion preference and removes transform movement when motion
is reduced. The dialog focuses its first form control when opened, contains Tab
navigation, closes through Escape, its close buttons, or the backdrop, and
returns focus to the action button after its exit animation when that button is
still present. Dialog labels, validation errors, row-level pending state, toast
announcements, and the disabled zero-stock resume explanation are exposed with
targeted ARIA attributes. The filters wrap on narrow screens, the panel remains
inside the viewport, and the semantic table is available in a keyboard-focusable
horizontal scroll region.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

- [Menu Control Panel Link](https://menu-control-panel.vercel.app/)
