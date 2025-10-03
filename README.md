# Crystal Store

Crystal Store is a Next.js e-commerce storefront powered by Stripe Checkout. It ships with responsive layouts, localized content, product discovery helpers, and a production-ready checkout flow so you can start selling instantly.

## Features
- **Stripe-first checkout** with support for single payments, linked payment sessions, and order confirmation pages.
- **Localized UI** using the in-house i18n layer for server and client components.
- **Variant-aware product catalog** that merges product and price metadata for consistent naming across the app.
- **Modern component library** built with Tailwind CSS, Radix UI primitives, and custom design tokens.
- **API integrations** for analytics, blob storage, newsletter signups, and optional AI-powered recommendations.

## Tech Stack
- [Next.js 15](https://nextjs.org/) with the App Router
- React 19 with Server Components
- TypeScript + Biome for linting and formatting
- Tailwind CSS with Radix UI
- Stripe SDKs for payments and webhooks
- Vitest + Testing Library for unit tests

## Getting Started
### Prerequisites
- Node.js 20 or later (22.x recommended)
- npm 11.5.2 (installed automatically via Corepack)
- A Stripe account in Test mode

### Installation
```bash
npm install
```

Copy the example environment file and adjust values as needed:
```bash
cp .env.example .env
```

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the storefront.

## Environment Variables
The project relies on Stripe and optional third-party services. The most important variables are:

| Variable | Required | Description |
| --- | :---: | --- |
| `ENABLE_EXPERIMENTAL_COREPACK` | Yes | Enables npm via Corepack in managed deployments. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key for the storefront. |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key used on the server. |
| `STRIPE_CURRENCY` | Yes | Default currency (e.g. `usd`). |
| `NEXT_PUBLIC_URL` | Optional | Public base URL of the store. |
| `STRIPE_WEBHOOK_SECRET` | Optional | Required when handling Stripe webhooks. |

Refer to `.env.example` for the complete list of supported variables.

## Stripe Setup
1. Create a product in the Stripe Dashboard with at least one active price.
2. Add the following metadata to each product or price:
   - `slug` – used for storefront URLs.
   - `category` – optional grouping label.
   - `variant` plus any `color`/`size` fields for variant handling.
3. Use the generated Stripe keys in your `.env` file.
4. (Optional) Configure a webhook endpoint at `/api/stripe-webhook` and set `STRIPE_WEBHOOK_SECRET`.

## Available Scripts
- `npm run dev` – start the development server.
- `npm run build` – create a production build.
- `npm start` – run the production build locally.
- `npm run lint` – run Biome checks with auto-fixes.
- `npm test` – run the Vitest suite.

## Deployment
Deploy the app to your preferred platform (Vercel, Docker, or custom hosting). Ensure your environment variables are configured before running `npm run build` in CI.

## License
This project is distributed under the terms of the [AGPL-3.0-only license](./LICENSE-AGPL.md). Commercial licensing options are available in [LICENSE-Commercial.md](./LICENSE-Commercial.md).
