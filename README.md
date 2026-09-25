# Bank Ledger API

A Node.js + Express + MongoDB backend for managing user accounts, deposits, withdrawals, and balance tracking in a ledger-style banking workflow.

## Overview

This project exposes REST APIs for:

- User registration and login
- Protected account creation and account listing
- Internal transaction processing
- Balance checks
- Ledger-based transaction tracking
- JWT-based authentication with cookie support
- Email notifications for registration and successful transactions

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Nodemailer for email delivery
- dotenv for environment configuration

## Project Structure

```bash
Bank-Ledger/
├── .env.example
├── package.json
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── accounts.controller.js
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── account.model.js
│   │   ├── blacklist.model.js
│   │   ├── ledger.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── accounts.routes.js
│   │   ├── auth.routes.js
│   │   └── transaction.routes.js
│   └── utils/
│       └── email.service.js
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- MongoDB running locally or a valid MongoDB connection string
- A Gmail account with OAuth2 credentials for email sending
- A JWT secret key

## Environment Setup

Copy `.env.example` to a new file named `.env` and fill in the values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bank-ledger
JWT_SECRET_KEY=your_jwt_secret

CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_refresh_token
EMAIL_USER=your_email@gmail.com
```

### Required Environment Variables

- `PORT`: Port for the Express server
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET_KEY`: Secret used to sign JWT tokens
- `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`: Gmail OAuth2 credentials for Nodemailer
- `EMAIL_USER`: Gmail account used to send emails

## Installation

```bash
npm install
```

## Run the Project

```bash
node server.js
```

The server will start on the configured `PORT` and log the URL in the console.

## Authentication

The app uses JWT tokens stored in cookies and also supports reading the token from the `Authorization` header as a Bearer token.

Protected routes require a valid token and are enforced via middleware in `src/middlewares/auth.middleware.js`.

### Auth Middleware Behavior

- Rejects requests with no token
- Rejects blacklisted/expired tokens
- Loads the authenticated user into `req.user`
- `systemAuthMiddleware` additionally requires the user to have `systemUser = true`

## API Endpoints

### 1) Authentication

#### Register User

- Method: `POST`
- Route: `/api/auth/register`
- Body:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "test1234"
}
```

#### Login User

- Method: `POST`
- Route: `/api/auth/login`
- Body:

```json
{
  "email": "user@example.com",
  "password": "test1234"
}
```

#### Logout User

- Method: `POST`
- Route: `/api/auth/logout`
- Uses the token from cookies or Authorization header and blacklists it.

---

### 2) Accounts

#### Create Account

- Method: `POST`
- Route: `/api/accounts/`
- Auth: Required
- Response: Creates a new account for the logged-in user

```json
{
  "message": "Account Created successFully",
  "account": {
    "user": "<user_id>",
    "status": "ACTIVE",
    "currency": "INR"
  }
}
```

#### Get All Accounts

- Method: `GET`
- Route: `/api/accounts/all`
- Auth: Required
- Returns all accounts belonging to the logged-in user

---

### 3) Transactions

#### Create Transfer Transaction

- Method: `POST`
- Route: `/api/transactions/`
- Auth: Required
- Body:

```json
{
  "from": "<user_id>",
  "to": "<user_id>",
  "amount": 500,
  "idempotencyKey": "txn-12345"
}
```

Rules:

- `from` must match the authenticated user
- Both accounts must exist and be active
- Sender must have sufficient balance
- Idempotency key prevents duplicate processing

#### Deposit

- Method: `POST`
- Route: `/api/transactions/deposit`
- Auth: System user required
- Body:

```json
{
  "toAccount": "<user_id>",
  "amount": 1000,
  "idempotencyKey": "deposit-001"
}
```

#### Withdrawal

- Method: `POST`
- Route: `/api/transactions/withdrawal`
- Auth: System user required
- Body:

```json
{
  "fromAccount": "<user_id>",
  "amount": 250,
  "idempotencyKey": "withdraw-001"
}
```

#### Check Balance

- Method: `GET`
- Route: `/api/transactions/balance`
- Auth: Required
- Returns the current balance for the authenticated user account

---

## Business Rules and Notes

- Each user can have only one account.
- Account status can be `ACTIVE`, `FROZEN`, or `CLOSED`.
- Default account currency is `INR`.
- Transaction amounts must be greater than zero.
- Transaction status can be `PENDING`, `COMPLETED`, `FAILED`, or `REVERSED`.
- Each transaction uses an `idempotencyKey` to prevent duplicate processing.
- Ledger entries are immutable and track every debit and credit for account balance reconciliation.
- Logout blacklists the JWT token for a short validity period.

## Data Models

### User Model

Fields:

- `email` (unique, required)
- `name` (required)
- `password` (hashed before save)
- `systemUser` (default: `false`)

### Account Model

Fields:

- `user` (reference to user)
- `status` (default: `ACTIVE`)
- `currency` (default: `INR`)

### Transaction Model

Fields:

- `from`
- `to`
- `amount`
- `status`
- `idempotencyKey` (unique)

### Ledger Model

Fields:

- `account`
- `type` (`CREDIT` or `DEBIT`)
- `transaction`
- `amount`

## Email Notifications

The project sends emails using Gmail OAuth2.

Email flows currently include:

- Registration confirmation
- Transaction success notification

If Gmail OAuth credentials are not set correctly, email sending may fail, but the core API logic will keep working.

## Notes for Developers

- The app is mounted and exposed from `src/app.js`.
- The server entry point is `server.js`.
- Database connection is established in `src/config/database.js`.
- Most logic is organized into controllers and route modules for easier maintenance.

## Suggested Improvements

- Add validation middleware for cleaner request validation
- Add pagination for account and transaction lists
- Add transaction history endpoint
- Add refresh token support
- Add role-based access for admins and system users
- Add unit and integration tests

## License

This project is licensed under the ISC license as declared in `package.json`.
