# Storefronts & Admin Operation Requests — Implementation Plan

- **Repo:** `85Gifts-Vendors` (Next.js 16 App Router frontend)
- **Branch:** `feat/storefronts-operation-requests` (created from `production` @ `dadc983`)
- **Source specs:** `STOREFRONT_API (1).md`, `ADMIN_OPERATION_REQUESTS_FRONTEND_GUIDE.md`
- **Status:** Implemented on `feat/storefronts-operation-requests` (Phases 1–5).
- **Locked decisions:** frontend repo only (backend is out of scope and will not be
  modified); rejection notes are required in the admin UI; sidebar label is
  **"Operation Requests"**.

---

## 1. Executive summary

Two features ship together because they share one lifecycle:

1. **Vendor Storefronts** — vendors create curated product collections, add/remove their own
   products, and request publication.
2. **Admin Operation Requests** — publishing a storefront is *not* immediate. The vendor's
   publish action creates a `storefront.publish` operation request. An admin approves or
   rejects it, and the vendor can cancel while it is pending.

The frontend work is a new vendor-facing **Storefronts** area plus a new admin **Operation
Requests** area, backed by thin Next.js route handlers that proxy the backend contract using
the same cookie/JWT patterns already used for products and admin events.

**Critical finding:** the local backend repo (`~/Projects/85giftsVendors-BE`, branch
`docs/reference-for-understanding`) contains **no** storefront or operation-request modules
(`grep -ri "storefront|operationrequest"` returns nothing). The API documents describe a
contract that is not implemented locally yet. **The backend is out of scope for this
branch — we will not modify that repo.** The frontend will be built against the documented
contract and admin preview fixtures, then verified end-to-end when the backend endpoints are
available on staging. Minimum backend expectations are recorded in §4 as an external
dependency only.

---

## 2. Contract summary

### 2.1 Vendor storefront endpoints

Base: `/api/vendors/storefronts` — Bearer vendor token.

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | POST | `/` | Create storefront (starts as draft) |
| 2 | GET | `/` | List own storefronts (`page`, `limit`, `isPublished`, `sortBy`, `sortOrder`) |
| 3 | GET | `/:id` | Get one storefront (products populated) |
| 4 | PUT | `/:id` | Update name/description/displaySettings (slug immutable) |
| 5 | DELETE | `/:id` | Delete storefront and product links |
| 6 | POST | `/:id/publish` | `{ isPublished }`; publish → approval request; unpublish immediate |
| 7 | POST | `/:id/products` | `{ productId }` add product |
| 8 | DELETE | `/:id/products/:productId` | Remove product |
| 9 | GET | `/:id/products` | Paginated populated products (`page`, `limit`) |
| 10 | GET | `/summary` | Totals: storefronts/published/draft/products |

Important ordering note for the backend: `/summary` must be registered **before** `/:id`,
otherwise Express treats `summary` as an id.

### 2.2 Vendor operation-request endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/vendors/operation-requests` | Own requests (`page`, `limit`, `status`) |
| POST | `/api/vendors/operation-requests/:id/cancel` | Cancel a pending request |

### 2.3 Admin operation-request endpoints

Base: `/api/admin/operation-requests` — admin token (`superAdmin`, `admin`, `subAdmin`).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | List (`page`, `limit`, `status`, `type`) |
| GET | `/:id` | Single request |
| POST | `/:id/approve` | Execute action, body `{ note? }` (≤500 chars) |
| POST | `/:id/reject` | Mark rejected, body `{ note? }` (≤500 chars) |

### 2.4 Publish lifecycle (authoritative)

```text
Vendor POST /storefronts/:id/publish { isPublished: true }
  ├─ 202 (new request) or 200 (already pending)
  ├─ storefront.isPublished        = false
  ├─ storefront.publishStatus      = "pending"
  └─ OperationRequest type="storefront.publish", status="pending"
        ├─ Admin approve → request="approved"; storefront.isPublished=true,
        │                  publishStatus="published", publishedAt=now
        ├─ Admin reject  → request="rejected"; storefront.isPublished=false,
        │                  publishStatus="rejected", reviewNote set
        └─ Vendor cancel → request="cancelled"; storefront.publishStatus="draft"

Vendor POST /storefronts/:id/publish { isPublished: false } → immediate unpublish
```

**Contract gaps to confirm with backend:**
- `publishStatus` is used in the publish endpoint and the admin guide but is missing from the
  documented storefront data model. Expected enum: `draft | pending | published | rejected`.
- Vendor request listing documents only `status` filtering; the UI needs to find the request
  for a specific storefront. Add `type` (and ideally `targetId`) filtering, or expose
  `latestOperationRequest` on the storefront detail response.
- Does a rejected storefront allow a new request, and does it clear the old `reviewNote`?
  Plan assumes yes: publish again creates a new pending request.
- List endpoint filters only `isPublished`; filtering by `publishStatus` would let the vendor
  UI offer Pending/Rejected tabs without client-side paging bugs. Optional enhancement.

---

## 3. Current codebase findings

### 3.1 Proxy architecture (must be followed)

The browser never calls the backend directly. Client components call same-origin
`/api/...`; Next.js route handlers read the httpOnly cookie and forward the Bearer token.

- **Vendor pattern** — `app/api/products/route.ts`:
  - `cookies().get('accessToken')`
  - `fetch(`${process.env.API_URL}/api/vendors/products`, { headers: { Authorization } })`
  - forward upstream status and JSON.
  - Missing token → `{ error: 'Unauthorized' }` 401.
- **Admin pattern** — `lib/admin-server.ts` → `adminFetchHttp()`:
  - cookie `adminAccessToken` (`lib/admin-constants.ts`)
  - base `${ADMIN_API_URL}/api/admin`
  - returns `{ status, ok, data }`.
- **Client wrappers** — `lib/api.ts#apiClient` (credentials include, 401 → vendor login),
  `lib/adminApi.ts#request` (credentials include, status/code on error).
- **UI conventions** — client components + `useState/useCallback/useEffect`, lucide icons,
  shadcn-style components (`Table`, `Badge`, `Skeleton`, `Dialog`, `AlertDialog`, `Select`,
  `Tabs`), `useToast` from `components/ui/use-toast`. No react-query.

### 3.2 Vendor UI

- Sidebar: `components/app-sidebar.tsx` (`navItems`, active state).
- Page titles: `components/site-header.tsx` (`titles` map).
- Layout: `app/dashboard/layout.tsx` → `components/dashboard-shell.tsx`.
- Existing reference screens: `app/dashboard/(protected)/products/page.tsx`,
  `components/products/ProductsTab.tsx`, `components/ProductForm.tsx`.
- Toast, dialogs, table, badge, skeleton all present.

### 3.3 Admin UI

- Shell/nav: `components/admin/AdminShell.tsx` (`navItems`, `NAV_TITLES`).
- Client service: `lib/adminApi.ts` (list helpers `toList`, `buildQuery`, preview branches).
- Types: `app/types/admin.ts` (shared `Pagination`).
- Reference screens: `components/admin/AdminEvents.tsx`, `AdminFees.tsx`,
  `AdminWalletTransactions.tsx`.
- Preview mode: `lib/adminPreview.ts` + `ADMIN_PREVIEW` branches; admin pages must keep
  working when `NEXT_PUBLIC_ADMIN_PREVIEW=true`.

### 3.4 Environment

`.env.local` currently has:
```env
RESELLER_API_URL=http://localhost:5500
ADMIN_API_URL=http://localhost:3000
```
There is no `API_URL` / `NEXT_PUBLIC_API_URL`, while vendor proxy routes read
`process.env.API_URL` directly (e.g. products). `config/index.ts` falls back to the Render
backend. Plan: add an explicit `API_URL` to `.env.local` (and document it) before testing
the new vendor proxies. Production env vars are separate and unchanged.

---

## 4. Backend dependency (external — **not in scope**)

> **Decision:** we are not changing `~/Projects/85giftsVendors-BE`. The items below are the
> minimum contract the frontend expects; they are listed for coordination with the backend
> owner and for verifying staging readiness. Until they exist, use admin preview fixtures
> and, for vendor flows, a temporary uncommitted mock.

Nothing in §2 exists locally. Minimum backend work required for the frontend contract:

1. **Models**
   - `Storefront`: `vendorId`, `name`, `description`, `slug` (unique per vendor, lowercase),
     `products: ObjectId[]`, `isPublished`, `publishStatus`, `publishedAt`,
     `displaySettings { banner, theme, layout }`, `analytics { views, totalOrders }`,
     timestamps. Index `{ vendorId, slug }` unique.
   - `OperationRequest`: `type`, `status`, `requesterId`, `requesterRole`, `targetId`,
     `targetType`, `payload`, `reviewedBy`, `reviewedAt`, `reviewNote`, timestamps.
     Indexes on `{ status, type, createdAt }` and `{ requesterId, status }`.
2. **Services/routes**
   - Storefront CRUD, slug generation/uniqueness suffix, product link validation (product
     must belong to same vendor).
   - Publish service: create/cancel deduped pending request; immediate unpublish; approval
     strategy (`storefront.publish`) that flips flags atomically.
   - Admin operation-request list/get/approve/reject; reject note; 409 on already-reviewed.
   - Vendor operation-request list/cancel.
   - 404 `STOREFRONT_NOT_FOUND`, 409 `DUPLICATE_STOREFRONT`, 400 `INVALID_ID`,
     404 `PRODUCT_NOT_FOUND`, 404 `OPERATION_REQUEST_NOT_FOUND`.
3. **Tests** for transitions: draft → pending → approved/rejected/cancelled; unpublish while
   pending; atomicity/conflict.

Because the backend is out of scope, the frontend will be developed with:
- admin preview fixtures (§6.6), and
- a temporary local mock (not committed) for vendor flows.

---

## 5. Domain model & TypeScript types

Create `app/types/storefront.ts`:

```ts
export type StorefrontLayout = 'grid' | 'list'
export type StorefrontPublishStatus = 'draft' | 'pending' | 'published' | 'rejected'

export interface StorefrontDisplaySettings {
  banner?: string
  theme?: string
  layout?: StorefrontLayout
}

export interface StorefrontAnalytics {
  views: number
  totalOrders?: number
}

export interface StorefrontProduct {
  _id: string
  vendorId?: string
  name: string
  description?: string
  category?: string
  price: number
  stock?: number
  images?: string[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Storefront {
  _id: string
  vendorId: string
  name: string
  description?: string
  slug: string
  products: string[] | StorefrontProduct[]   // ids in list, populated in detail
  isPublished: boolean
  publishStatus?: StorefrontPublishStatus     // contract gap: normalize to "draft" when absent
  publishedAt?: string | null
  displaySettings?: StorefrontDisplaySettings
  analytics?: StorefrontAnalytics
  createdAt: string
  updatedAt: string
}

export interface StorefrontSummary {
  totalStorefronts: number
  publishedStorefronts: number
  draftStorefronts: number
  totalProductsAcrossStorefronts: number
}

export interface StorefrontPublishResult {
  message: string
  operationRequest?: { _id: string; type: string; status: string }
  storefront: { _id: string; isPublished: boolean; publishStatus: StorefrontPublishStatus }
}
```

Create `app/types/operationRequest.ts`:

```ts
import type { Pagination } from './admin'

export type OperationRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type OperationRequestType = 'storefront.publish' | (string & {})

export interface StorefrontPublishPayload {
  storefrontId: string
  name: string
  slug: string
}

export interface OperationRequest<TPayload = Record<string, unknown>> {
  _id: string
  type: OperationRequestType
  status: OperationRequestStatus
  requesterId: string
  requesterRole: 'vendor'
  targetId?: string
  targetType?: 'storefront' | string
  payload: TPayload
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
  createdAt: string
  updatedAt: string
}

export interface OperationRequestList {
  requests: OperationRequest[]
  pagination: Pagination
}
```

Add a type guard `isStorefrontPublishRequest()` so admin/vendor UI can safely read
`payload.name` / `payload.slug` / `payload.storefrontId`.

Normalization rules:
- Treat missing `publishStatus` as `'draft'` when `isPublished === false`, else `'published'`.
- Product arrays may be ids or populated objects — use a `getProductId()` helper.
- Admin list shape is `data.requests`; storefront list is `data.storefronts`; summary is
  `data` directly.

---

## 6. Frontend implementation

### 6.1 Shared server helpers

Create `lib/vendor-server.ts` (mirrors `lib/admin-server.ts`):

```ts
export const VENDOR_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function getVendorAccessToken(): Promise<string | undefined>
export async function vendorFetchHttp(opts: {
  method?: string
  path: string            // e.g. '/storefronts'
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}): Promise<{ status: number; ok: boolean; data: any }>
```

- No token → `{ status: 401, data: { success:false, message:'Access token required', code:'TOKEN_REQUIRED' } }`
- Forward upstream status/body verbatim so the client can branch on `202`, `409`, etc.
- Never leak the token to the browser.

### 6.2 Route handlers

| New file | Methods | Upstream |
|----------|---------|----------|
| `app/api/storefronts/route.ts` | GET, POST | `/api/vendors/storefronts` |
| `app/api/storefronts/summary/route.ts` | GET | `/api/vendors/storefronts/summary` |
| `app/api/storefronts/[id]/route.ts` | GET, PUT, DELETE | `/api/vendors/storefronts/:id` |
| `app/api/storefronts/[id]/publish/route.ts` | POST | `/api/vendors/storefronts/:id/publish` |
| `app/api/storefronts/[id]/products/route.ts` | GET, POST | `/api/vendors/storefronts/:id/products` |
| `app/api/storefronts/[id]/products/[productId]/route.ts` | DELETE | `.../products/:productId` |
| `app/api/operation-requests/route.ts` | GET | `/api/vendors/operation-requests` |
| `app/api/operation-requests/[id]/cancel/route.ts` | POST | `.../:id/cancel` |
| `app/api/admin/operation-requests/route.ts` | GET | `/api/admin/operation-requests` |
| `app/api/admin/operation-requests/[id]/route.ts` | GET | `/api/admin/operation-requests/:id` |
| `app/api/admin/operation-requests/[id]/approve/route.ts` | POST | `.../approve` |
| `app/api/admin/operation-requests/[id]/reject/route.ts` | POST | `.../reject` |

Admin handlers use `adminFetchHttp({ path: '/operation-requests' })`; do **not** add
`/admin` to the path because the helper already prefixes it.

Forward only whitelisted query keys:
- storefront list: `page`, `limit`, `isPublished`, `publishStatus` (if added), `sortBy`, `sortOrder`
- storefront products: `page`, `limit`
- vendor requests: `page`, `limit`, `status`, `type` (if added)
- admin requests: `page`, `limit`, `status`, `type`

### 6.3 Client API services

`lib/storefrontApi.ts` (browser → own proxy) using a small `request()` helper with
`credentials: 'include'`, JSON parsing, and the repo's standard error extraction
(`error.message | error | message`):

```ts
storefrontApi.list({ page, limit, isPublished, sortBy, sortOrder })
storefrontApi.summary()
storefrontApi.get(id)
storefrontApi.create({ name, description?, slug?, displaySettings? })
storefrontApi.update(id, { name?, description?, displaySettings? })
storefrontApi.remove(id)
storefrontApi.publish(id, isPublished)           // returns { status, data }
storefrontApi.listProducts(id, { page, limit })
storefrontApi.addProduct(id, productId)
storefrontApi.removeProduct(id, productId)
```

`lib/vendorOperationRequestApi.ts`:

```ts
list({ page, limit, status, type? }): Promise<OperationRequestList>
cancel(id): Promise<OperationRequest>
findForStorefront(storefrontId): Promise<OperationRequest | null>
```

`lib/adminApi.ts` — add:

```ts
listOperationRequests(params)
getOperationRequest(id)
approveOperationRequest(id, note?)
rejectOperationRequest(id, note?)
pendingOperationRequestCount()
```

Reuse `buildQuery`, `inner`, the existing `request` wrapper, and add
`ADMIN_PREVIEW` branches (§6.6).

### 6.4 Vendor UI

**Routes**
- `app/dashboard/(protected)/storefronts/page.tsx` → `<StorefrontsTab />`
- `app/dashboard/(protected)/storefronts/[id]/page.tsx` → `<StorefrontDetail id={id} />`
  (server component unwraps `params` promise, passes string id)

**Components** (`components/storefronts/`)
- `StorefrontsTab.tsx` — list screen:
  - Summary cards (Total, Published, Drafts, Products across storefronts) from
    `GET /summary`; graceful fallback if summary fails (still render list).
  - Search (name/slug, client-side on current page) + status filter
    `All | Published | Unpublished` mapped to `isPublished`; status badges also show
    Pending/Rejected from `publishStatus`.
  - Card grid (`sm:grid-cols-2 xl:grid-cols-3`) or table; each card: banner or gradient,
    name, `/slug`, publish badge, products count, views/orders, updated date; actions:
    Open, Edit, Delete, Publish/Unpublish.
  - Loading skeletons, empty state with "Create your first storefront", error banner with
    retry.
  - Pagination (`page`/`pages`/`total`) matching `AdminEvents`.
- `StorefrontFormDialog.tsx` — create/edit dialog:
  - Fields: `name` (required, ≤200), `description` (textarea, ≤1000), `slug` (create only,
    optional; preview `slugify(name)`; lowercase/numbers/hyphens validation; helper text
    "Slug cannot be changed later"), `displaySettings.banner` (URL input with preview),
    `theme` (≤100), `layout` (`grid`/`list` select).
  - Client validation mirrors backend; server errors surfaced inline/toast; 409 duplicate
    slug message.
  - On create, use the **server-returned slug** (backend may append a suffix).
- `StorefrontDetail.tsx` — detail screen:
  - Header: back link, name, `/slug`, status badge, Publish/Unpublish control,
    Edit and Delete.
  - **Products section**: paginated list (`GET /:id/products`) with image, name, price,
    stock, remove action (confirm). "Add products" opens `StorefrontProductPicker`.
  - **Approval panel** (see §7): pending notice + submitted date + Cancel request;
    rejected notice + admin `reviewNote` + "Request approval again"; published notice with
    `publishedAt` and (future) share URL; draft notice.
  - **Analytics section**: views / total orders cards (`analytics` may be absent → zeros).
  - **Settings section**: banner preview, theme, layout; Edit opens the form dialog.
- `StorefrontProductPicker.tsx`:
  - Dialog listing vendor products from `productApi.getAll()` (normalize
    `data.data.data | data.data | array` like `ProductsTab`).
  - Search by name; exclude ids already in the storefront; multi-select; add sequentially
    via `POST /:id/products` (API is single-add). Show partial-failure summary if one fails.
- `StorefrontStatusBadge.tsx`:
  - `draft` gray, `pending` amber, `published` green, `rejected` red; label text
    "Pending approval", "Rejected", etc.
- `PublishStorefrontDialog.tsx` (optional):
  - Publish → confirmation explaining admin approval; Unpublish → destructive confirmation
    stating it goes offline immediately.
  - If unpublishing while pending: backend cancels the request; explain that in copy.

**Navigation**
- Add `{ title: "Storefronts", url: "/dashboard/storefronts", icon: Store }` to
  `components/app-sidebar.tsx` (after Products).
- Add `"/dashboard/storefronts": "Storefronts"` to `components/site-header.tsx`.
- Optional: add a `side-storefronts` step to `components/onboarding/tour-config.tsx` and a
  `data-tour-id` on the nav item. Not required for the feature; skip in phase 1 to avoid
  tour regressions.

### 6.5 Admin UI

**Route**
- `app/admin/(protected)/operation-requests/page.tsx` → `<AdminOperationRequests />`

**Components** (`components/admin/`)
- `AdminOperationRequests.tsx`:
  - Header with description and refresh button.
  - Status tabs: Pending (default) / Approved / Rejected / Cancelled / All.
  - Type select: All Types / Storefront Publish (`storefront.publish`).
  - Table columns exactly per guide:
    - Request Type — label map `{ 'storefront.publish': 'Publish Storefront' }`, fallback
      humanized `type`.
    - Details / Target — for storefront publish: `payload.name` and `/payload.slug`.
    - Vendor ID — `requesterId`, monospace, copy button.
    - Submitted — relative time ("15 mins ago") with full timestamp tooltip/title.
    - Status — colored badge (amber/green/red/gray).
    - Review Note — truncated text or `—`.
    - Actions — only when `pending`: Approve (green outline) / Reject (red outline);
      a "View" icon opens the detail dialog for every row.
  - Pagination identical to `AdminEvents`.
  - Loading skeleton rows, empty state, error banner.
  - On 409 during action: refetch list, toast "This request was already reviewed", close
    dialog.
- `OperationRequestReviewDialog.tsx`:
  - Two modes (`approve` | `reject`) driven by selected request.
  - Shows full request metadata (payload, requester, target, created/reviewed timestamps,
    existing note).
  - Approve: optional textarea "Add an optional note for audit/vendor", max 500,
    primary "Approve & Publish".
  - Reject: **required** textarea "Reason for rejection" (max 500, trimmed, counter shown);
    submit disabled while empty; destructive "Reject Request". The text is sent as the
    request's `note` body field and appears to the vendor as `reviewNote`, so they know
    exactly what to fix.
  - Disable actions while submitting; show inline server error.
  - On success: close, refetch list, emit badge refresh event, toast
    "Request approved" / "Request rejected".
- `OperationRequestDetailDialog.tsx` (optional, can be folded into the review dialog):
  - Read-only view for non-pending rows including `reviewedBy`, `reviewedAt`, `reviewNote`.
  - Keeping one dialog with a read-only state is less code.

**Navigation + pending badge**
- Add `{ title: "Operation Requests", url: "/admin/operation-requests", icon: ClipboardCheck }`
  to `AdminShell` nav and `NAV_TITLES`.
- Badge count:
  - `GET /api/admin/operation-requests?status=pending&limit=1` → `pagination.total`.
  - Fetch on mount, on `pathname` change, and every 60s (only refetch when
    `document.visibilityState === 'visible'`; abort on unmount).
  - Render as a small pill on the right of the nav label; hide when 0; cap `99+`.
  - Refresh immediately after approve/reject via a tiny event helper
    (`lib/operationRequestsEvents.ts`: `emitOperationRequestsChanged()` /
    `subscribeToOperationRequestsChanged(cb)`) rather than introducing a new context.
  - Failures are silent (badge only) and must not block the page.

### 6.6 Admin preview mode

`NEXT_PUBLIC_ADMIN_PREVIEW=true` currently bypasses admin auth and uses fixtures. Keep it
working:
- Add `previewOperationRequests` (2–3 pending + approved + rejected, realistic storefront
  payloads) to `lib/adminPreview.ts`.
- Add preview branches to every new `adminApi` method:
  - `listOperationRequests` filters/sorts/paginates the fixture array.
  - `approveOperationRequest` mutates status + `reviewedAt`/`reviewNote` and returns the item.
  - `rejectOperationRequest` does the same with `rejected`.
  - `pendingOperationRequestCount` counts pending.
- This lets the admin UI be reviewed without a backend.

---

## 7. Publish lifecycle in the vendor UI

Derived state (never trust `isPublished` alone):

```ts
type StorefrontUiState = 'draft' | 'pending' | 'published' | 'rejected'

function deriveState(s: Storefront, latest?: OperationRequest): StorefrontUiState {
  if (s.isPublished) return 'published'
  if (s.publishStatus === 'pending' || latest?.status === 'pending') return 'pending'
  if (s.publishStatus === 'rejected' || latest?.status === 'rejected') return 'rejected'
  return 'draft'
}
```

| State | Primary action | Copy / behavior |
|-------|----------------|-----------------|
| `draft` | **Request approval** | Explains admin review before going live. `POST publish {true}`. |
| `pending` | **Cancel request** (secondary, destructive) | Banner: "Submitted for approval · <date>". Publish button disabled. |
| `published` | **Unpublish** | Confirmation: "This removes the storefront from the public link immediately." |
| `rejected` | **Request approval again** | Banner with `reviewNote`; new request on click. |

Handling responses:
- `202` → pending toast + update local storefront from `data.storefront`; keep
  `data.operationRequest._id` in memory.
- `200` with `data.storefront.publishStatus === 'pending'` (already pending) → info toast,
  no duplicate.
- `200` on unpublish → draft/unpublished state, toast.
- On reload, resolve the pending request via `vendorOperationRequestApi`:
  `status=pending` (and `status=rejected` for the latest note), filter by
  `payload.storefrontId`/`targetId`. If backend cannot filter by type/target yet, fetch a
  reasonable page and filter client-side; document the limitation.
- 401 → `apiClient` redirects to vendor login; 403 → permission toast; 404 → not-found
  state; 409 → refetch.

---

## 8. Validation, errors, and edge cases

**Client validation**
- Storefront: `name` required ≤200; `description` ≤1000; slug matches
  `^[a-z0-9]+(?:-[a-z0-9]+)*$`; `theme` ≤100; `layout` in `grid|list`; banner a valid
  `http(s)` URL or empty.
- Review note ≤500 (hard `maxLength` + counter) and trimmed. **Required for rejections**
  (submit disabled when empty); optional for approvals.
- Prevent double submits; disable actions per row during requests.

**Error mapping (admin)**
| Status | UI behavior |
|--------|-------------|
| 400 | Inline validation message (note length / bad id). |
| 401 | Existing admin route guard/login handling; toast "Session expired". |
| 403 | Toast "You do not have permission to review requests." |
| 404 | Toast "Request no longer exists"; refetch. |
| 409 | Toast "Already reviewed or cancelled"; refetch + close dialog. |

**Edge cases**
- Deleting a storefront while a request is pending → backend should cancel/ignore; UI warns
  in the delete confirmation when state is pending.
- Products deleted elsewhere disappear from the storefront silently; `GET /:id/products`
  remains the source of truth.
- Duplicate slug: show server error; don't assume client slug is final.
- Empty summary/analytics → zeros, never `NaN`.
- Pagination after mutations → refetch current page; step back if page becomes empty and
  page > 1.
- Long IDs → truncate/copy chip; mobile table → hide secondary columns like existing admin
  tables.

---

## 9. Implementation phases

| Phase | Work | Acceptance |
|-------|------|------------|
| **0. Contract readiness** | Confirm the documented endpoints are available on staging (§4 is external only — we do not modify the backend), finalize `publishStatus` enum and vendor request filtering. Add `API_URL` to local env docs. | Endpoints reachable in staging or fixtures agreed. |
| **1. Types + server/client plumbing** | `app/types/storefront.ts`, `operationRequest.ts`, `lib/vendor-server.ts`, all proxy routes, `lib/storefrontApi.ts`, `lib/vendorOperationRequestApi.ts`, admin API additions. | `curl` via Next proxy returns upstream status/body; 401 without cookie; types compile. |
| **2. Vendor list + create/edit/delete** | Storefronts nav/title, list screen, summary cards, create/edit dialog, delete confirm. | Create → appears with correct server slug; duplicate slug error handled; edit excludes slug; delete removes card. |
| **3. Vendor detail + products** | Detail route/screen, product pagination, product picker, add/remove. | Add/remove persists after reload; only own products selectable; empty/invalid product errors surfaced. |
| **4. Vendor publish + requests** | Publish/unpublish controls, pending/rejected/published banners, cancel request, resubmit. | Publish → pending, not public; cancel → draft; admin approve → published; reject → note visible + resubmit works; unpublish immediate. |
| **5. Admin approvals** | Route, nav + badge, table/tabs/filters/pagination, review dialog, toasts/409 handling. | Pending default; approve/reject updates row and badge; note validation; non-pending rows read-only; preview mode works. |
| **6. Polish + verification** | Empty/loading/error states, mobile layout, a11y labels, preview fixtures, lint/typecheck/build, manual E2E with backend/staging. | `pnpm lint` + `pnpm build` clean; full lifecycle passes on staging. |

Rough effort: phases 1–5 ≈ 4–6 dev days frontend; phase 6 ≈ 1 day. Backend coordination is
external and not estimated here.

---

## 10. Testing plan

**Automated (repo has no test runner, so keep to what exists)**
- `pnpm lint`
- `npx tsc --noEmit` (or `pnpm build`, which type-checks)
- `pnpm build`

**Manual matrix**
1. Vendor unauthenticated → `/dashboard/storefronts` redirects to login; proxy returns 401.
2. Create with/without slug; duplicate slug → 409 message; verify returned slug.
3. Edit name/description/banner/theme/layout; slug field absent and unchanged.
4. Delete storefront → product links removed, products themselves unaffected.
5. Add duplicate product / foreign product id → handled error; remove product.
6. Publish → `isPublished:false`, `publishStatus:pending`, request created; repeated click
   does not create a second request (200 path).
7. Cancel pending → request cancelled, storefront draft.
8. Admin approves → storefront published + `publishedAt`; badge decrements; vendor sees
   published on refresh.
9. Admin rejects with note → vendor sees note and can resubmit.
10. Unpublish → immediate; any pending request cancelled.
11. Admin table filters/tabs/pagination; approve/reject conflict (two admins / stale row)
    → 409 toast + refetch.
12. Review note >500 blocked client-side; backend 400 handled.
13. `NEXT_PUBLIC_ADMIN_PREVIEW=true`: approvals page and badge work without backend.
14. Mobile: cards stack, table columns collapse, dialogs scroll.

**Contract checks (with backend)**
- Verify `data.storefronts` vs `data.requests` nesting, 202/200 publish responses,
  `publishStatus` values, `summary` route ordering, and slug suffix behavior.

---

## 11. Risks and decisions

### Decisions locked
1. **Backend scope** — out of scope. We only change `85Gifts-Vendors`; the backend repo is
   untouched. §4 is a coordination checklist, not work for this branch. Verify against
   staging when available, otherwise use admin preview plus an uncommitted local mock.
2. **Reject reason** — required. The Reject button stays disabled until a trimmed note is
   entered; max 500 chars; the note is sent as `note`.
3. **Nav label** — **"Operation Requests"** (the guide's first-listed option; page title
   matches).

### Decisions still open
4. **Vendor request filtering** — will backend add `type`/`targetId` to
   `GET /api/vendors/operation-requests`? If not, pending-request discovery is a page scan.
5. **Admin preview** — keep supported (plan does) or let it degrade when online?
6. **Storefront detail** — dedicated route (plan) vs modal-only.

### Risks
- **Highest:** backend endpoints absent → no real E2E until implemented. Mitigate with
  contract tests and `ADMIN_PREVIEW`.
- **Path inconsistency:** existing vendor APIs are mounted at both `/api/vendors` and
  `/api/vendor` (events). Storefronts must use `/api/vendors/storefronts` exactly as
  documented; don't copy the event prefix.
- **`publishStatus` undefined** in the documented model → normalize client-side and confirm
  with backend; otherwise badges and buttons misreport state.
- **Express route ordering** for `/summary`.
- **`API_URL` missing locally** → vendor proxies fail; fix env before testing.
- **Race/conflict** on approvals → always handle 409 + refetch.
- **Slug immutability** → never send slug on update or show an editable slug after create.

### Out of scope (per docs "Future Enhancements")
Public storefront viewing endpoint/page, view-count tracking, per-storefront order
attribution, analytics dashboard, bulk product operations, product reordering, sharing/
embedding, SEO. **Backend implementation is out of scope and will not be touched.**

---

## 12. File checklist

**New — types/services**
- `app/types/storefront.ts`
- `app/types/operationRequest.ts`
- `lib/vendor-server.ts`
- `lib/storefrontApi.ts`
- `lib/vendorOperationRequestApi.ts`
- `lib/operationRequestsEvents.ts`

**New — proxy routes**
- `app/api/storefronts/route.ts`
- `app/api/storefronts/summary/route.ts`
- `app/api/storefronts/[id]/route.ts`
- `app/api/storefronts/[id]/publish/route.ts`
- `app/api/storefronts/[id]/products/route.ts`
- `app/api/storefronts/[id]/products/[productId]/route.ts`
- `app/api/operation-requests/route.ts`
- `app/api/operation-requests/[id]/cancel/route.ts`
- `app/api/admin/operation-requests/route.ts`
- `app/api/admin/operation-requests/[id]/route.ts`
- `app/api/admin/operation-requests/[id]/approve/route.ts`
- `app/api/admin/operation-requests/[id]/reject/route.ts`

**New — vendor UI**
- `app/dashboard/(protected)/storefronts/page.tsx`
- `app/dashboard/(protected)/storefronts/[id]/page.tsx`
- `components/storefronts/StorefrontsTab.tsx`
- `components/storefronts/StorefrontFormDialog.tsx`
- `components/storefronts/StorefrontDetail.tsx`
- `components/storefronts/StorefrontProductPicker.tsx`
- `components/storefronts/StorefrontStatusBadge.tsx`
- `components/storefronts/PublishStorefrontDialog.tsx`

**New — admin UI**
- `app/admin/(protected)/operation-requests/page.tsx`
- `components/admin/AdminOperationRequests.tsx`
- `components/admin/OperationRequestReviewDialog.tsx`

**Modified**
- `components/app-sidebar.tsx` — Storefronts nav
- `components/site-header.tsx` — Storefronts title
- `components/admin/AdminShell.tsx` — Approvals nav + pending badge
- `lib/adminApi.ts` — operation-request methods
- `lib/adminPreview.ts` — preview fixtures + helpers
- `app/types/admin.ts` — only if shared types are added there (prefer separate file)
- `.env.local` / env docs — `API_URL`
