# Manakamana Printing Backend API Reference

## Overview

- Base URL: `http://localhost:8005/api/v1`
- Auth:
  - Public: no token required
  - Client: `Authorization: Bearer <client-token>`
  - Admin: `Authorization: Bearer <admin-token>`
- Content types:
  - JSON for most endpoints
  - `multipart/form-data` for file uploads

## Common Response Shapes

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Validation or business error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable error message"
  }
}
```

## Core Flows

### Dynamic Product Order Flow

1. Admin creates a service.
2. Admin creates a product under that service and can set a product-level discount.
3. Admin creates product fields.
4. Admin adds dropdown options for dropdown fields.
5. Admin creates product pricing rows for pricing fields, with optional pricing-row discounts.
6. Admin can update or remove those discounts later.
7. Client fetches service products.
8. Client fetches a product and renders the returned dynamic fields.
9. Client uploads files with `POST /uploads` when a field type is `FILE`.
10. Client checks live price with `POST /products/:productId/price` during order creation.
11. Frontend shows discount before submit using the price response.
12. Client places order with `POST /orders`.
13. Client pays with wallet using `POST /orders/:orderId/confirm-wallet-payment`.
14. Admin advances order status with `PATCH /admin/orders/:orderId/status`.

### File Upload Flow

1. Frontend uploads a file to `POST /uploads`.
2. Backend returns a public `fileUrl`.
3. Frontend sends that URL as the `value` of a `FILE` product field during order creation.

### Wallet Payment Flow

1. Client checks `GET /wallet/balance`.
2. Client places order.
3. Client pays with `POST /orders/:orderId/confirm-wallet-payment`.
4. Admin can then accept the paid order.

### ID Card Order Flow

1. Admin uploads an ID-card product image through `POST /uploads` if needed.
2. Admin creates an ID-card product with `POST /admin/idcards/products`.
3. Admin can later update the base price, percentage discount, fixed discount, active flag, or image URL with `PATCH /admin/idcards/products/:idcardProductId`.
4. Client fetches active ID-card products with `GET /idcards/products`.
5. Client fetches one ID-card product with `GET /idcards/products/:idcardProductId`.
6. Client previews backend pricing with `POST /idcards/products/:idcardProductId/price`.
7. Client uploads their own photo through `POST /uploads` and sends that returned URL as `photos_link`.
8. Client places the ID-card order with `POST /idcards/orders`.
9. Client pays with the shared wallet endpoint `POST /orders/:orderId/confirm-wallet-payment`.
10. Admin reviews ID-card orders with `GET /admin/idcards/orders`.

## Replaced Legacy Catalog Endpoints

These variant-based endpoints are no longer the active catalog flow and should not be used by the frontend:

- `GET /products`
- `GET /products/:productId/variants`
- `GET /variants/:variantId/options`
- `POST /pricing/calculate`
- `POST /variants/:variantId/calculate-price`
- `POST /admin/products/:productId/variants`
- `POST /admin/variants/:variantId/option-groups`
- `POST /admin/groups/:groupId/option-values`
- `POST /admin/variants/:variantId/pricing`
- `GET /admin/variants/:variantId/full-details`
- `GET /admin/pricing/:variantId`
- `PATCH /admin/pricing/:pricingId`

## Public and Shared Routes

### Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/login` | Public | Client login credentials | Client token + profile |
| POST | `/auth/logout` | Public | None | Logout message |
| GET | `/auth/me` | Any logged-in user | None | Current user profile |

Example request:

```json
{
  "phone_number": "9800000000",
  "password": "password123"
}
```

### Registration, Services, Catalog, Upload

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register-request` | Public | Business registration fields | Created registration request |
| GET | `/services` | Public | None | Active services list |
| GET | `/services/:serviceId` | Public | None | Single service |
| GET | `/services/:serviceId/products` | Client | None | Service details + active products |
| GET | `/products/:productId` | Client | None | Product details + dynamic fields + product-level discount |
| POST | `/products/:productId/price` | Client | `quantity`, `fields[]` | Calculated live price for the order form |
| POST | `/uploads` | Public | `file`, optional `folder` multipart fields | Uploaded `fileUrl` |

### ID Card Catalog and Orders

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/idcards/products` | Client | None | Active ID-card products with backend-calculated pricing for quantity `1` |
| GET | `/idcards/products/:idcardProductId` | Client | None | Single active ID-card product with pricing summary |
| POST | `/idcards/products/:idcardProductId/price` | Client | `quantity` | Backend-calculated ID-card pricing for the selected quantity |
| POST | `/idcards/orders` | Client | ID-card order payload | Created ID-card order |
| GET | `/idcards/orders` | Client | None | Client ID-card order list |
| GET | `/idcards/orders/:orderId` | Client | None | Client ID-card order details |

ID-card price preview request:

```json
{
  "quantity": 25
}
```

ID-card product example response:

```json
{
  "success": true,
  "data": {
    "id": "idcard-product-uuid",
    "product_type": "ID_CARD",
    "product_code": "EMP-ID-001",
    "name": "Employee PVC ID Card",
    "description": "Single staff ID card with strap support",
    "image_url": "https://cdn.example.com/idcards/employee-id-card.png",
    "is_active": true,
    "base_price": 120,
    "discount_type": "percentage",
    "discount_value": 10,
    "pricing": {
      "quantity": 1,
      "base_unit_price": 120,
      "discount_type": "percentage",
      "discount_value": 10,
      "discount_amount_per_unit": 12,
      "total_discount_amount": 12,
      "final_unit_price": 108,
      "total_amount": 120,
      "final_amount": 108
    }
  }
}
```

Create ID-card order example request:

```json
{
  "idcardProductId": "idcard-product-uuid",
  "quantity": 25,
  "printing_side": "double",
  "orientation": "landscape",
  "strap_color": "blue",
  "strap_text": "Manakamana Printing",
  "notes": "Use the latest employee photograph"
}
```

Create ID-card order example response:

```json
{
  "success": true,
  "message": "ID card order placed successfully",
  "data": {
    "id": "order-uuid",
    "order_type": "ID_CARD",
    "quantity": 25,
    "unit_price": 120,
    "total_amount": 3000,
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_amount": 300,
    "final_amount": 2700,
    "status": "ORDER_PLACED",
    "payment_status": "PENDING",
    "idcard_product": {
      "id": "idcard-product-uuid",
      "product_code": "EMP-ID-001",
      "name": "Employee PVC ID Card"
    },
    "idcard_detail": {
      "printing_side": "double",
      "orientation": "landscape",
      "strap_color": "blue",
      "strap_text": "Manakamana Printing"
    }
  }
}
```

Dynamic product example response:

```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "service_id": "service-uuid",
    "product_code": "A4-BILL-BOOK",
    "name": "A4 Bill Book",
    "base_price": 120.0,
    "discount_type": "percentage",
    "discount_value": 10,
    "fields": [
      {
        "id": "field-uuid-1",
        "field_key": "paper_quality",
        "label": "Paper Quality",
        "type": "DROPDOWN",
        "is_required": true,
        "is_pricing_field": true,
        "options": [
          { "id": "opt-1", "value": "90_GSM", "label": "90 GSM", "display_order": 0 }
        ]
      },
      {
        "id": "field-uuid-2",
        "field_key": "artwork",
        "label": "Artwork File",
        "type": "FILE",
        "is_required": true,
        "is_pricing_field": false,
        "options": []
      }
    ]
  }
}
```

Price check example request:

```json
{
  "quantity": 100,
  "fields": [
    { "fieldId": "field-uuid-1", "value": "90_GSM" }
  ]
}
```

Price check example response:

```json
{
  "success": true,
  "data": {
    "product_id": "product-uuid",
    "product_code": "A4-BILL-BOOK",
    "quantity": 100,
    "unit_price": 120.0,
    "discount_source": "pricing_matrix",
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_amount": 1200.0,
    "total_amount": 12000.0,
    "final_amount": 10800.0,
    "pricing_matrix_id": "matrix-uuid",
    "combination_key": "{\"field-uuid-1\":\"90_GSM\"}",
    "selected_options": [
      {
        "field_id": "field-uuid-1",
        "field_key": "paper_quality",
        "label": "Paper Quality",
        "value": "90_GSM",
        "display_value": "90 GSM"
      }
    ]
  }
}
```

## Client Routes

### User Profile

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/user/profile` | Client | None | Current client profile |
| PATCH | `/user/profile` | Client | Profile fields | Updated profile |

### Orders

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/orders` | Client | `productId`, `quantity`, `fields[]`, `notes?` | Created order |
| GET | `/orders` | Client | None | Client order list |
| GET | `/orders/:orderId` | Client | None | Full order details |
| POST | `/orders/:orderId/confirm-wallet-payment` | Client | Empty JSON body | Wallet payment result |

Create order example request:

```json
{
  "productId": "product-uuid",
  "quantity": 100,
  "notes": "Please deliver before Friday",
  "fields": [
    { "fieldId": "field-uuid-1", "value": "90_GSM" },
    { "fieldId": "field-uuid-2", "value": "https://public-storage.example.com/uploads/file.pdf" },
    { "fieldId": "field-uuid-3", "value": "ABC Store Pvt. Ltd." }
  ]
}
```

Create order example response:

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": "order-uuid",
    "user_id": "client-uuid",
    "product_id": "product-uuid",
    "quantity": 100,
    "unit_price": 120.0,
    "total_amount": 12000.0,
    "final_amount": 10800.0,
    "status": "ORDER_PLACED",
    "payment_status": "PENDING",
    "items": [
      {
        "field_key_snapshot": "paper_quality",
        "field_label_snapshot": "Paper Quality",
        "field_type_snapshot": "DROPDOWN",
        "value": "90_GSM",
        "display_value": "90 GSM"
      }
    ]
  }
}
```

### Templates

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/templates/categories` | Client | None | Template categories |
| GET | `/templates` | Client | None | Template list |
| GET | `/templates/:templateId` | Client | None | Single template |

### Design Submission and Approved Designs

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/design-submissions` | Client | Multipart `file` + metadata | Created design submission |
| GET | `/design-submissions/my` | Client | None | Client design submissions |
| GET | `/design-submissions/my/:submissionId` | Client | None | Single client submission |
| GET | `/my-designs/:designId` | Client | None | Approved design details |
| POST | `/designs/verify` | Client | Design code payload | Verified design result |

Design submission example response:

```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "status": "PENDING_REVIEW",
    "fileUrl": "https://public-storage.example.com/designs/design.pdf"
  }
}
```

## Wallet Routes

### Client Wallet

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/wallet/payment-details` | Client | None | Active company payment details |
| POST | `/wallet/topup-requests` | Client | Multipart `proofFile` + top-up fields | Created top-up request |
| GET | `/wallet/topup-requests` | Client | None | Client top-up requests |
| GET | `/wallet/topup-requests/:requestId` | Client | None | Single top-up request |
| GET | `/wallet/balance` | Client | None | Wallet balance |
| GET | `/wallet/transactions` | Client | Query filters | Wallet transactions |
| POST | `/wallet/validate-checkout` | Client | Checkout amount payload | Validation result |
| GET | `/wallet/notifications` | Client | None | Client notifications |
| PATCH | `/wallet/notifications/:notificationId/read` | Client | None | Updated notification |

Wallet payment example response:

```json
{
  "success": true,
  "message": "Wallet payment applied successfully",
  "data": {
    "orderId": "order-uuid",
    "walletTransactionId": "txn-uuid",
    "paymentStatus": "PAID",
    "deductedAmount": 12000,
    "newWalletBalance": 3000
  }
}
```

### Admin Wallet

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/admin/wallet/payment-details` | Admin | Payment detail fields | Created payment detail |
| GET | `/admin/wallet/topup-requests` | Admin | Query filters | Top-up requests |
| GET | `/admin/wallet/topup-requests/:requestId` | Admin | None | Single top-up request |
| POST | `/admin/wallet/topup-requests/:requestId/approve` | Admin | Approval payload | Approved request |
| PATCH | `/admin/wallet/topup-requests/:requestId/reject` | Admin | Rejection payload | Rejected request |
| GET | `/admin/wallet/transactions` | Admin | Query filters | System transactions |
| GET | `/admin/wallet/notifications` | Admin | None | Admin notifications |
| PATCH | `/admin/wallet/notifications/:notificationId/read` | Admin | None | Updated notification |
| GET | `/admin/wallet/clients/:clientId` | Admin | None | Client wallet summary |

## Admin Routes

### Admin Auth and Client Management

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/admin/auth/login` | Public | Admin login credentials | Admin token + profile |
| POST | `/admin/auth/logout` | Public | None | Logout message |
| GET | `/admin/auth/me` | Admin | None | Current admin |
| GET | `/admin/registration-requests` | Admin | None | Registration requests |
| GET | `/admin/registration-requests/:request_id` | Admin | None | Single request |
| POST | `/admin/registration-requests/:request_id/approve` | Admin | None | Approved request |
| PATCH | `/admin/registration-requests/:request_id/reject` | Admin | Rejection payload | Rejected request |
| GET | `/admin/clients` | Admin | None | Client list |
| GET | `/admin/clients/:id` | Admin | None | Single client |

### Admin Templates and Design Review

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/admin/templates/categories` | Admin | Category payload | Created category |
| POST | `/admin/templates` | Admin | Multipart template file + metadata | Created template |
| GET | `/admin/design-submissions` | Admin | Query filters | Design submissions |
| GET | `/admin/design-submissions/:submissionId` | Admin | None | Single submission |
| POST | `/admin/design-submissions/:submissionId/approve` | Admin | Approval payload | Approved submission |
| PATCH | `/admin/design-submissions/:submissionId/reject` | Admin | Rejection payload | Rejected submission |
| GET | `/admin/designs` | Admin | None | Approved designs |
| GET | `/admin/designs/:designId` | Admin | None | Single approved design |
| PATCH | `/admin/designs/:designId/archive` | Admin | Archive payload | Archived design |

### Admin Services, Dynamic Products, and Pricing

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/admin/services` | Admin | None | All services |
| POST | `/admin/services` | Admin | Service payload | Created service |
| GET | `/admin/products` | Admin | None | All products with fields |
| GET | `/admin/products/:productId` | Admin | None | Single product with fields |
| POST | `/admin/services/:serviceId/products` | Admin | Product payload including optional product discount | Created product |
| PATCH | `/admin/products/:productId` | Admin | Partial product payload including discount update | Updated product |
| DELETE | `/admin/products/:productId/discount` | Admin | None | Remove product-level discount |
| POST | `/admin/products/:productId/fields` | Admin | Product field payload | Created field |
| PATCH | `/admin/fields/:fieldId` | Admin | Partial field payload | Updated field |
| POST | `/admin/fields/:fieldId/options` | Admin | Field option payload | Created option |
| PATCH | `/admin/options/:optionId` | Admin | Partial option payload | Updated option |
| POST | `/admin/products/:productId/pricing` | Admin | `selectedOptions[]`, `unit_price`, optional discount | Created pricing row |
| GET | `/admin/products/:productId/pricing` | Admin | None | Product pricing rows |
| PATCH | `/admin/pricing/:pricingId` | Admin | Partial pricing payload including discount update | Updated pricing row |
| DELETE | `/admin/pricing/:pricingId/discount` | Admin | None | Remove pricing-row discount |

Create product field example request:

```json
{
  "field_key": "paper_quality",
  "label": "Paper Quality",
  "type": "DROPDOWN",
  "is_required": true,
  "display_order": 1,
  "is_pricing_field": true
}
```

Create pricing row example request:

```json
{
  "selectedOptions": [
    { "fieldId": "field-uuid-1", "value": "90_GSM" },
    { "fieldId": "field-uuid-2", "value": "SOFT_BINDING" }
  ],
  "unit_price": 120,
  "discount_type": "fixed",
  "discount_value": 10
}
```

Create product example request:

```json
{
  "product_code": "A4-BILL-BOOK",
  "name": "A4 Bill Book",
  "description": "A4 bill book with duplicate pages",
  "base_price": 120,
  "discount_type": "percentage",
  "discount_value": 5
}
```

Update product discount example request:

```json
{
  "discount_type": "fixed",
  "discount_value": 25
}
```

Update pricing discount example request:

```json
{
  "discount_type": "percentage",
  "discount_value": 15
}
```

### Admin Orders

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/admin/orders` | Admin | None | All orders |
| GET | `/admin/orders/:orderId` | Admin | None | Full order details |
| PATCH | `/admin/orders/:orderId/status` | Admin | `status` | Updated status |

### Admin ID Card Management

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/admin/idcards/products` | Admin | ID-card product payload | Created ID-card product |
| GET | `/admin/idcards/products` | Admin | None | All ID-card products with pricing summaries |
| GET | `/admin/idcards/products/:idcardProductId` | Admin | None | Single ID-card product |
| PATCH | `/admin/idcards/products/:idcardProductId` | Admin | Partial ID-card product payload | Updated ID-card product |
| GET | `/admin/idcards/orders` | Admin | None | All ID-card orders |
| GET | `/admin/idcards/orders/:orderId` | Admin | None | Single ID-card order detail |

Create ID-card product example request:

```json
{
  "product_code": "EMP-ID-001",
  "name": "Employee PVC ID Card",
  "description": "Double-side employee ID card",
  "image_url": "https://cdn.example.com/idcards/employee-id-card.png",
  "base_price": 120,
  "discount_type": "percentage",
  "discount_value": 10,
  "is_active": true
}
```

Update ID-card product example request:

```json
{
  "base_price": 140,
  "discount_type": "fixed",
  "discount_value": 15,
  "image_url": "https://cdn.example.com/idcards/employee-id-card-v2.png"
}
```

Order status request example:

```json
{
  "status": "ORDER_ACCEPTED"
}
```

## Dynamic Catalog Payload Rules

- `TEXT`: freeform string, stored as submitted.
- `NUMBER`: must be numeric, stored as normalized numeric string.
- `DROPDOWN`: value must match one active option of the field.
- `FILE`: value must be a valid uploaded file URL.
- Only `DROPDOWN` fields can set `is_pricing_field=true`.
- Only pricing fields participate in `ProductPriceMatrix` matching.
- If a product has pricing fields, every pricing field must be present during pricing calculation and order creation.
- If a product has no pricing fields, `base_price` is used and optional product-level discount is applied.
- If a product has pricing fields, `ProductPriceMatrix.unit_price` is used and optional pricing-row discount is applied.
- Admin controls product-level discount through:
  - `POST /admin/services/:serviceId/products`
  - `PATCH /admin/products/:productId`
  - `DELETE /admin/products/:productId/discount`
- Admin controls pricing-row discount through:
  - `POST /admin/products/:productId/pricing`
  - `PATCH /admin/pricing/:pricingId`
  - `DELETE /admin/pricing/:pricingId/discount`
- Supported discount types are `fixed` and `percentage`.
- `percentage` discount is applied on the total amount.
- `fixed` discount is a flat order-level amount, not multiplied by quantity.
- During order creation, the frontend should call `POST /products/:productId/price` whenever quantity or pricing fields change so the user sees the discount before submitting the order.

## Order Request and Response Rules

- `quantity` is always top-level and required.
- `fields` is an array of dynamic values:

```json
[
  { "fieldId": "uuid", "value": "some value" }
]
```

- Order snapshotting:
  - `Order.pricing_snapshot` stores the price context used at creation time.
  - `OrderItem` stores field snapshots so later admin edits do not rewrite old orders.
  - ID-card orders store the submitted `printing_side`, `photos_link`, `orientation`, `strap_color`, and `strap_text` in both `Order.pricing_snapshot` and `IdCardOrderDetail`.
- Discount storage:
  - `Order.discount_type`, `Order.discount_value`, and `Order.discount_amount` are filled during order creation.
  - `Order.final_amount` is the payable amount after discount.
  - For ID-card products, both percentage and fixed discounts are applied per card unit before multiplying by quantity.

## Upload Request

`POST /uploads` uses `multipart/form-data`:

- `file`: required uploaded file
- `folder`: optional folder name, for example `orders`, `templates`, `designs`

Upload example response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileUrl": "https://public-storage.example.com/orders/uuid.pdf"
  }
}
```
