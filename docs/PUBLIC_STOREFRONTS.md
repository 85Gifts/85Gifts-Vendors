# Public Storefronts

Implementation notes for the public (unauthenticated) storefront experience.

## Routes

| Page | Purpose |
| --- | --- |
| `/storefronts` | Browse published storefronts, search, sort, and paginate. |
| `/store/[slug]` | Storefront detail with banner, products, variants, and product pagination. |
| `/order/[reference]` | Free-order confirmation, or a direct order-reference page. |
| `/order/callback` | Paystack return page; reads `reference`/`trxref` from the callback URL. |

Public navigation now includes **Storefronts**.

## Same-origin API proxies

Browser code never calls the backend directly:

| Proxy | Upstream |
| --- | --- |
| `GET /api/public/storefronts` | `GET /api/public/storefronts` |
| `GET /api/public/storefronts/[slug]` | `GET /api/public/storefronts/:slug` |
| `POST /api/public/storefronts/[slug]/orders` | `POST /api/public/storefronts/:slug/orders` |

`lib/public-server.ts` performs upstream calls with `config.BACKEND_URL`.
`lib/public-proxy.ts` preserves the upstream status, body, and rate-limit
headers (`Retry-After`, `X-RateLimit-*`).

The detail endpoint increments storefront views, so it is fetched with
`cache: "no-store"`. The listing uses a 60-second revalidation window.

## Checkout flow

1. Products are added to an in-page cart. Products with variants open an option
   picker and require a `variantSku`.
2. Checkout collects customer details and an optional delivery address.
3. `POST /api/public/storefronts/:slug/orders` creates the order.
4. If the response contains `paymentUrl`, the browser is redirected to Paystack.
   Paystack returns to `/order/callback?storefront=:slug`.
5. Free orders (`totalAmount === 0`, no `paymentUrl`) go to
   `/order/:orderReference?status=success`.

Customer/delivery validation mirrors the contract: name 1–200 characters, valid
email, phone at most 50 characters, 1–30 items, and quantity 1–50. A delivery
address is optional, but if any address field is started, address line 1, city,
and state are required.

## Backend dependency

These pages require the **Public Storefront API** documented in
`PUBLIC_STOREFRONT_API.md` (global storefront slugs, published-storefront
listing, combined detail/products response, and order creation). The backend
repository is not modified by this branch.

## Local preview

The backend does not implement these endpoints yet, so UI work can be checked
against any local mock server by pointing the frontend at it:

```bash
API_URL=http://127.0.0.1:5501 pnpm dev --port 3100
```

Then open `http://localhost:3100/storefronts`.
