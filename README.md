# SSU Frontend

Storefront and admin dashboard for Shop System United, built with Nuxt 4, Vue 3, Pinia, and Tailwind CSS.

## Tech Stack

- **Framework:** Nuxt 4 (Vue 3, SSR for public storefront routes)
- **State Management:** Pinia (with client-side persistence)
- **Styling:** Tailwind CSS (with dynamic theme colors via CSS variables)
- **Icons:** @nuxt/icon
- **CMS:** @nuxt/content (for static pages like About)

## Pages

### Storefront

| Route              | Description                        |
|--------------------|------------------------------------|
| `/`                | Homepage / landing page            |
| `/shop`            | Product catalog                    |
| `/cart`            | Shopping cart                      |
| `/checkout`        | Checkout (shipping, payment)       |
| `/order-success`   | Order confirmation                 |
| `/payment/complete`| Payment callback (Stripe, PayPal)  |
| `/tracking`        | Order tracking                     |
| `/backorder/pay/:token` | Backorder payment page        |
| `/about`           | About page                         |
| `/contact`         | Contact page                       |

### Admin Panel (`/admin`)

| Route                       | Description               |
|-----------------------------|---------------------------|
| `/admin`                    | Dashboard (stats, orders) |
| `/admin/products`           | Product management        |
| `/admin/categories`         | Category management       |
| `/admin/orders`             | Order management          |
| `/admin/discounts`          | Discount codes            |
| `/admin/shipping`           | Shipping settings         |
| `/admin/tax-settings`       | Tax configuration         |
| `/admin/payment-settings`   | Payment providers         |
| `/admin/backorders`         | Backorder management      |
| `/admin/settings`           | Store settings            |
| `/admin/login`              | Admin login               |
| `/admin/verify-2fa`         | Two-factor verification   |
| `/admin/forgot-password`    | Password recovery         |
| `/admin/reset-password`     | Password reset            |

## Application Flows

### Admin Authentication

1. User visits `/admin/login` and submits email + password
2. Frontend fetches a CSRF cookie from `/sanctum/csrf-cookie` (Laravel Sanctum)
3. Sends `POST /api/login` with credentials
4. If **2FA is enabled**, the API responds with `two_factor_required: true`
   - User is redirected to `/admin/verify-2fa`
   - User enters the code sent to their email
   - `POST /api/two-factor/verify` completes the login
5. If **2FA is not enabled**, the user is authenticated immediately
6. Auth state is managed by the `useAuthStore` (Pinia) and checked via `GET /api/user`
7. The `auth` middleware protects all `/admin/*` routes (except login, forgot-password, reset-password, verify-2fa) — unauthenticated users are redirected to `/admin/login`

### Shopping & Cart

1. User browses products on `/shop`
2. Adding a product stores it in `useCartStore` (Pinia, persisted to localStorage)
3. Cart page (`/cart`) shows all items with quantity controls
4. Cart calculates subtotal, tax (via `GET /api/tax-settings`), and shipping (via `POST /api/shipping/calculate`)

### Checkout & Payment

1. User proceeds to `/checkout` — if cart is empty, they are redirected to `/cart`
2. User fills in customer info, selects delivery method (delivery or self-pickup), and shipping address
3. Shipping cost is recalculated automatically when address fields change (debounced)
4. Optional: user applies a discount code via `POST /api/discounts/validate`
5. User selects a payment method (loaded from `GET /api/payment-settings/methods`):

**Cash on Delivery:**
- `POST /api/orders` creates the order
- User is redirected to `/order-success`

**Stripe:**
- `POST /api/orders` creates the order first
- `StripePayment` component mounts with the order ID
- User enters card details in Stripe Elements
- On success, redirected to `/payment/complete?payment_id=...`

**PayPal / Square (redirect-based):**
- `POST /api/orders` creates the order
- `POST /api/orders/{id}/pay` returns a redirect URL
- User is redirected to the provider's hosted checkout
- Provider redirects back to `/payment/complete` on success

6. If the server returns **429 (Too Many Requests)**, a busy overlay appears and the request retries automatically (up to 3 times with `Retry-After` header support)

### Order Confirmation Email

After a successful payment, the backend sends an order confirmation email to the customer with:
- Order number and itemized list (product name, quantity, price)
- Subtotal, discount (if applied), tax, shipping, and total
- Shipping address or pickup note

### Backorder Payment

1. When backordered items are back in stock, admin sends a payment link from `/admin/backorders`
2. Customer receives an email with a tokenized link to `/backorder/pay/:token`
3. The page verifies the token, shows order details with itemized breakdown (subtotal, tax, shipping, total)
4. **Stock is re-verified** when the customer clicks "Pay" — if stock has since been depleted, the UI immediately shows an out-of-stock warning and disables payment
5. Customer selects a payment method (Stripe, PayPal, or Square) and completes payment
6. On success, redirected to `/payment/complete`

**Charge policies:**
- `charged_now` — customer pays for backorder items at checkout (included in order total)
- `charged_later` — customer pays later via the payment link when stock arrives

### Stock Display

Product stock visibility is controlled by the `show_stock_quantity` setting in site config (managed from admin Settings > Features):

- **Off (default):** Customers see "In Stock", "Out of Stock", or "Backorder" — no specific number shown
- **On:** Customers see the exact count, e.g. "In Stock (23)"

This applies to the product detail page (`/product/:slug`), product cards on `/shop`, and the product quick-view modal. The admin product table always shows the exact stock number regardless of this setting.

### Order Tracking

- Customer visits `/tracking` and enters their order ID or email to check order status

## Architecture

### Key Files

| File | Purpose |
|------|---------|
| `plugins/ApiFetch.ts` | Configures `$apiFetch` with base URL, credentials, and XSRF token |
| `plugins/pinia-persist.client.ts` | Persists Pinia stores (cart, favorites) to localStorage |
| `stores/auth.ts` | Admin authentication state and actions |
| `stores/useCartStore.ts` | Cart items, tax, shipping calculation |
| `stores/useFavoritesStore.ts` | Product favorites/wishlist |
| `middleware/auth.ts` | Route guard for admin pages |
| `composables/useTheme.ts` | Applies dynamic theme CSS variables |
| `composables/useSiteConfig.ts` | Loads store config (name, logo, feature toggles, etc.) |
| `composables/useRegions.ts` | Country/state/city data for address forms |
| `composables/useRecaptcha.ts` | Google reCAPTCHA integration |

## Running with Docker (Recommended)

This app is designed to run via Docker Compose from the root `ssu-infra/` directory. No local `npm install` needed.

```bash
# From the project root (ssu-infra/)
docker compose up -d          # Development
docker compose -f docker-compose-prod.yml up -d --build  # Production
```

See the root [README.md](../README.md) for full setup instructions.

## Environment Variables

| Variable                        | Description                     |
|---------------------------------|---------------------------------|
| `NUXT_PUBLIC_API_BASE`          | Backend API base URL            |
| `NUXT_PUBLIC_API_PATH`          | API path prefix (e.g. `/api`)   |
| `NUXT_PUBLIC_BASE_URL`          | Public site URL                 |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`| Google reCAPTCHA site key       |
| `NUXT_API_BASE`                 | Server-only API origin used by Nitro SSR |
| `NUXT_PUBLIC_SEO_INDEXING_ENABLED` | Enables indexing in production; keep `false` on localhost |

## Theming

Colors are driven by CSS variables defined in the store settings. The Tailwind config maps `blue-*` utilities to `--color-primary-*` variables, so the entire theme can be changed from the admin panel without rebuilding.
