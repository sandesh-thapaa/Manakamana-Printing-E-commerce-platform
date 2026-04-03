# ID Card Ordering System: Integration Guide for Frontend Developers

This document serves as a comprehensive guide for integrating the ID card ordering flow. It mirrors the structure of the official Postman collection and provides the exact request/response schemas required for frontend development.

---

## 🛠 Integration Prerequisites

- **Base URL**: `{{baseUrl}}` (e.g., `http://localhost:5000/api/v1`)
- **Headers**: Most endpoints require `Authorization: Bearer <token>`.
- **Content Type**:
    - Standard requests use `application/json`.
    - Uploads (Proofs/Designs) use `multipart/form-data`.

---

## 🔑 Phase 1: Authentication & Onboarding

### 1. Admin Login
The administrator must log in to manage registration requests and create products.

<details>
<summary><b>POST</b> <code>/admin/auth/login</code> - (Show Details)</summary>

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Admin login successful",
  "token": "JWT_ADMIN_TOKEN",
  "admin": {
    "id": "admin-uuid",
    "name": "Admin Name",
    "email": "admin@gmail.com",
    "role": "ADMIN"
  }
}
```
</details>

### 2. Client Registration Request
New businesses submit their details for verification.

<details>
<summary><b>POST</b> <code>/register-request</code> - (Show Details)</summary>

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "business_name": "My Business",
  "owner_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "9800000000",
  "business_address": "Kathmandu", // Optional
  "notes": "Test registration" // Optional
}
```
**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration request submitted successfully",
  "data": {
    "id": "request-uuid",
    "status": "PENDING"
  }
}
```
</details>

### 3. Admin Approves Client
Admin converts a "Request" into a "Client" account. This generates the initial login password.

<details>
<summary><b>POST</b> <code>/admin/registration-requests/:requestId/approve</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{adminToken}}`

**Path Variables:**
- `requestId`: The ID from Step 2.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client approved successfully",
  "data": {
    "clientId": "9800000000",
    "generatedPassword": "RANDOM_PASSWORD",
    "clientUuid": "client-uuid"
  }
}
```
</details>

### 4. Client Login
The approved client logs in to their dashboard.

<details>
<summary><b>POST</b> <code>/auth/login</code> - (Show Details)</summary>

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "phone_number": "9800000000",
  "password": "RANDOM_PASSWORD"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "JWT_CLIENT_TOKEN",
  "client": {
    "id": "client-uuid",
    "phone": "9800000000",
    "business_name": "My Business",
    "role": "CLIENT"
  }
}
```
</details>

---

## 💰 Phase 2: Wallet Lifecycle

### 5. Get Bank/Payment Details
Client checks where to send money for a top-up.

<details>
<summary><b>GET</b> <code>/wallet/payment-details</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{clientToken}}`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "companyName": "Manakamana Printing",
    "bankName": "NIC ASIA",
    "accountNumber": "1234567890",
    "qrImageUrl": "https://supabase-link.com/qr.png"
  }
}
```
</details>

### 6. Submit Top-up Request
Client uploads proof of transfer.

<details>
<summary><b>POST</b> <code>/wallet/topup-requests</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{clientToken}}`
- `Content-Type: multipart/form-data`

**Body (Form-Data):**
- `amount`: `1000` (Number)
- `paymentMethod`: `BANK_TRANSFER` (String)
- `proofFile`: (File)
- `transferReference`: `REF123` // Optional
- `note`: `Wallet top-up` // Optional

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Top-up request submitted successfully",
  "data": { "requestId": "topup-uuid", "status": "PENDING_REVIEW" }
}
```
</details>

### 7. Admin Approves Top-up
Admin confirms receipt and adds funds to the client's wallet.

<details>
<summary><b>POST</b> <code>/admin/wallet/topup-requests/:requestId/approve</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{adminToken}}`

**Request Body:**
```json
{
  "approvedAmount": 1000,
  "note": "Verified" // Optional
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "data": { "newWalletBalance": 1000 }
}
```
</details>

---

## 📇 Phase 3: ID Card Ordering

### 8. Admin Creates ID Card Product
Admin sets the base price and available options.

<details>
<summary><b>POST</b> <code>/admin/idcards/products</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{adminToken}}`

**Request Body:**
```json
{
  "product_code": "PVC-01",
  "name": "Standard PVC Card",
  "base_price": 100,
  "description": "Premium quality cards", // Optional
  "image_url": "https://example.com/image.png", // Optional
  "discount_type": "percentage", // Optional ("percentage" | "fixed")
  "discount_value": 0, // Optional (Required if discount_type is set)
  "is_active": true // Optional
}
```
</details>

### 9. Client Discovery & Pricing
Client browses products and calculates price before ordering.

<details>
<summary><b>POST</b> <code>/idcards/products/:productId/price</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{clientToken}}`

**Request Body:**
```json
{
  "quantity": 50,
  "printing_side": "double" // Optional ("single" | "double") - Default: "single"
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "base_unit_price": 140, 
      "final_amount": 7000
    }
  }
}
```
</details>

### 10. Place ID Card Order
Client submits the order details.

<details>
<summary><b>POST</b> <code>/idcards/orders</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{clientToken}}`

**Request Body:**
```json
{
  "idcardProductId": "product-uuid",
  "quantity": 50,
  "printing_side": "double",
  "orientation": "portrait", // ("landscape" | "portrait")
  "strap_color": "Blue",
  "strap_text": "Manakamana Printing",
  "notes": "Custom text here" // Optional
}
```
**Success Response (201 Created):**
```json
{
  "success": true,
  "data": { "id": "order-uuid", "final_amount": 7000 }
}
```
</details>

### 11. Finalize with Wallet Payment
Client pays for the created order using their wallet balance.

<details>
<summary><b>POST</b> <code>/orders/:orderId/confirm-wallet-payment</code> - (Show Details)</summary>

**Headers:**
- `Authorization: Bearer {{clientToken}}`

**Request Body:**
```json
{
  "useWallet": true
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Wallet payment applied successfully",
  "data": {
    "paymentStatus": "PAID",
    "newWalletBalance": 93000
  }
}
```
</details>

---

### 🚀 Production Checklist for Frontend
- [ ] Ensure `Authorization` header is sent with every request (except Login/Register Request).
- [ ] Implement `multipart/form-data` for the top-up proof upload.
- [ ] Update UI to dynamically reflect the **+40 NPR** surcharge when "Double Side" is selected in the ID card form.
- [ ] Handle `401 Unauthorized` by redirecting to the login page.
