# Lead Query Service

A production-oriented **multi-tenant CRM Lead Query API** built with **Node.js, Express, TypeScript, PostgreSQL, Prisma, and Zod**.

The service provides a flexible query engine for CRM leads, supporting:

* Multi-tenant data isolation
* Role-based lead visibility
* Full-text-style search across lead fields
* Dynamic system-field filtering
* Dynamic custom-field filtering using an **EAV (Entity-Attribute-Value)** model
* AND / OR filter logic
* Pagination
* Dynamic sorting
* Query parameter validation
* Request-body validation
* Unknown custom-field handling
* Total result counts and pagination metadata

The primary engineering challenge is building a query layer that can combine **static database columns** with **dynamic custom fields** without compromising tenant isolation, correctness, or maintainability.

---

## ✨ Key Features

### Multi-Tenant Architecture

Every lead belongs to a tenant.

The API always applies tenant isolation before executing lead queries, preventing users from accidentally accessing data belonging to another tenant.

```text
Request
   │
   ▼
Authentication Context
   │
   ▼
Tenant Isolation
   │
   ▼
Role-Based Visibility
   │
   ▼
System Filters / Custom Filters / Search
   │
   ▼
Pagination + Sorting
   │
   ▼
PostgreSQL
```

---

### Role-Based Lead Visibility

The service supports role-aware lead visibility.

Example roles:

```text
owner
admin
manager
agent
```

Higher-level users can access broader sets of leads, while restricted users only see leads they are authorized to access.

The visibility rule is built independently from the query filters so authorization remains a separate concern from filtering.

---

### Flexible Search

The `q` parameter searches across multiple lead fields:

* `name`
* `phone`
* `email`
* `e164`

Example:

```json
{
  "q": "Vijay",
  "logic": "AND",
  "filters": []
}
```

This can return:

```text
Vijay Kumar
```

without requiring a dedicated filter for the `name` field.

---

### System Field Filtering

The API supports filters for standard lead columns.

Supported fields include:

```text
name
email
assignedTo
followUpDate
```

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "name",
      "fieldType": "string",
      "condition": "contain",
      "value": "Vijay"
    }
  ]
}
```

---

### Custom Field Filtering with EAV

CRM systems frequently allow administrators to create custom fields dynamically.

Instead of modifying the `Lead` table every time a new field is created, custom fields are stored separately using an EAV-style design.

Example:

```text
Lead
 ├── id
 ├── name
 ├── email
 └── ...

CustomField
 ├── id
 ├── tenantId
 ├── label
 └── type

LeadCustomFieldValue
 ├── leadId
 ├── fieldId
 └── value
```

For example:

```text
Lead: Vijay Kumar

City     → Salem
Industry → Finance
```

The same Lead table can therefore support new fields such as:

```text
Company
Budget
Source
Department
Customer Type
Location
```

without requiring a schema change for every new field.

---

## 🧠 Query Architecture

The query engine separates filters into two categories.

### 1. System Filters

System fields are mapped directly to Prisma `LeadWhereInput`.

```text
name
email
assignedTo
followUpDate
```

Example:

```text
name contains "Vijay"
```

becomes conceptually:

```text
Lead.name CONTAINS "Vijay"
```

---

### 2. Custom Filters

Custom fields are resolved against the tenant's `CustomField` records.

Example request:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "CITY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Salem"
    }
  ]
}
```

The service:

1. Resolves the custom field.
2. Verifies it belongs to the current tenant.
3. Builds the EAV condition.
4. Combines it with the normal lead query.
5. Executes the final query against PostgreSQL.

This keeps the query service flexible while preserving tenant boundaries.

---

# 🏗️ Project Structure

```text
server/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   │
│   ├── controller/
│   │   └── leadController.ts
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── middleware/
│   │   └── auth.ts
│   │
│   ├── service/
│   │   ├── lead.service.ts
│   │   ├── lead-visibility.service.ts
│   │   ├── system-filter.service.ts
│   │   └── custom-filter.service.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   └── lead.ts
│   │
│   ├── validator/
│   │   ├── leadQuery.ts
│   │   └── queryLeadsBody.ts
│   │
│   └── app.ts
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🛠️ Tech Stack

| Technology                | Purpose               |
| ------------------------- | --------------------- |
| Node.js                   | Runtime               |
| Express                   | HTTP API framework    |
| TypeScript                | Type safety           |
| PostgreSQL                | Relational database   |
| Prisma                    | ORM / database access |
| Zod                       | Runtime validation    |
| Prisma PostgreSQL Adapter | PostgreSQL connection |
| Git                       | Version control       |

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

Check versions:

```bash
node --version
npm --version
psql --version
```

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Lead_query/server
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
PORT=3000
```

Replace the database credentials with your local PostgreSQL configuration.

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 5. Apply Database Schema

```bash
npx prisma db push
```

---

## 6. Seed Development Data

```bash
npx prisma db seed
```

The seed creates:

* Multiple tenants
* Users
* Leads
* Custom fields
* EAV custom-field values

This allows the query engine to be tested immediately.

---

## 7. Start the Server

Development:

```bash
npm run dev
```

Or, depending on the project's scripts:

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

---

# 🔐 Authentication Context

Authentication is simulated through request headers for this project.

Example:

```http
x-tenant-id: <tenant-id>
x-user-id: <user-id>
x-user-role: admin
```

Example:

```http
x-tenant-id: e3bcde2f-46b0-4f5f-b4c1-c1117c16bbe9
x-user-id: 60f86eb0-faf5-4412-90ae-a0200ea30c63
x-user-role: admin
```

> In a production environment, these values should come from a verified authentication mechanism such as JWT/session middleware rather than directly trusting client-provided headers.

---

# 📡 API Reference

## Query Leads

```http
GET /api/v1/leads/query
```

The endpoint accepts pagination and sorting through query parameters and filtering/search criteria through the request body.

---

## Query Parameters

| Parameter       | Type   | Example     | Description                |
| --------------- | ------ | ----------- | -------------------------- |
| `page`          | number | `1`         | Page number                |
| `limit`         | number | `20`        | Number of records per page |
| `sortBy`        | string | `createdAt` | Field used for sorting     |
| `sortDirection` | string | `desc`      | `asc` or `desc`            |

Example:

```text
/api/v1/leads/query?page=1&limit=20&sortBy=createdAt&sortDirection=desc
```

---

# 📦 Request Body

Basic query:

```json
{
  "logic": "AND",
  "filters": []
}
```

Search query:

```json
{
  "q": "Vijay",
  "logic": "AND",
  "filters": []
}
```

---

# 🔎 Filter Format

Each filter follows this structure:

```json
{
  "fieldId": "name",
  "fieldType": "string",
  "condition": "contain",
  "value": "Vijay"
}
```

### Fields

| Property    | Description                     |
| ----------- | ------------------------------- |
| `fieldId`   | System field or custom-field ID |
| `fieldType` | Type of field                   |
| `condition` | Comparison operation            |
| `value`     | Value used for comparison       |

---

# 🧩 Supported System Filters

## Name

Supported conditions:

```text
is
is not
contain
does not contain
starts with
ends with
is empty
is not empty
```

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "name",
      "fieldType": "string",
      "condition": "contain",
      "value": "Vijay"
    }
  ]
}
```

---

## Email

Supported conditions:

```text
is
is not
contain
does not contain
starts with
ends with
is empty
is not empty
```

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "email",
      "fieldType": "string",
      "condition": "contain",
      "value": "@example.com"
    }
  ]
}
```

---

## Assigned User

Supported conditions:

```text
is
is not
contain
does not contain
is empty
is not empty
```

Multiple user IDs can be provided as a comma-separated value.

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "assignedTo",
      "fieldType": "string",
      "condition": "is",
      "value": "USER_ID_1,USER_ID_2"
    }
  ]
}
```

---

## Follow-Up Date

Supported conditions:

```text
before
after
is empty
is not empty
```

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "followUpDate",
      "fieldType": "date",
      "condition": "before",
      "value": "2026-08-10"
    }
  ]
}
```

---

# 🧱 Custom Field Filtering

Custom fields use their database-generated field ID.

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "7c3950b7-af97-42d2-8e99-37d64bc05fe7",
      "fieldType": "string",
      "condition": "is",
      "value": "Salem"
    }
  ]
}
```

If the custom field represents:

```text
City
```

the query returns leads whose City value is:

```text
Salem
```

---

# 🔀 AND / OR Logic

The query engine supports combining multiple filters.

## AND

All filters must match.

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "name",
      "fieldType": "string",
      "condition": "contain",
      "value": "Vijay"
    },
    {
      "fieldId": "CITY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Salem"
    }
  ]
}
```

Conceptually:

```text
name contains "Vijay"
AND
City = "Salem"
```

---

## OR

At least one filter must match.

```json
{
  "logic": "OR",
  "filters": [
    {
      "fieldId": "name",
      "fieldType": "string",
      "condition": "contain",
      "value": "Vijay"
    },
    {
      "fieldId": "email",
      "fieldType": "string",
      "condition": "contain",
      "value": "@example.com"
    }
  ]
}
```

Conceptually:

```text
name contains "Vijay"
OR
email contains "@example.com"
```

---

# 🔍 Search + Filters

The global search query can be combined with filters.

Example:

```json
{
  "q": "Vijay",
  "logic": "AND",
  "filters": [
    {
      "fieldId": "CITY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Salem"
    }
  ]
}
```

Conceptually:

```text
Tenant Visibility
AND
City = Salem
AND
(
  name contains Vijay
  OR phone contains Vijay
  OR email contains Vijay
  OR e164 contains Vijay
)
```

This allows the endpoint to support both structured filtering and free-text searching.

---

# 📤 Example Response

```json
{
  "status": "success",
  "message": "Leads fetched successfully",
  "data": [
    {
      "id": "8b9275cf-862d-4fc5-b7d4-59af9ea9233a",
      "tenantId": "e3bcde2f-46b0-4f5f-b4c1-c1117c16bbe9",
      "userId": "60f86eb0-faf5-4412-90ae-a0200ea30c63",
      "name": "Vijay Kumar",
      "phone": "9876543221",
      "countryCode": "+91",
      "e164": "+919876543221",
      "email": "vijay@example.com",
      "assignedTo": "b28f5fc0-aaf4-4195-94df-e04cec221d00",
      "followUpDate": "2026-08-15T00:00:00.000Z",
      "createdAt": "2026-08-26T14:09:03.309Z",
      "updatedAt": "2026-08-26T14:09:03.309Z",
      "customFields": [
        {
          "fieldId": "7c3950b7-af97-42d2-8e99-37d64bc05fe7",
          "label": "City",
          "value": "Salem"
        },
        {
          "fieldId": "6b9d5bed-6e21-48f4-b1bf-7880c65d105e",
          "label": "Industry",
          "value": "Finance"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

---

# 📊 Pagination

Pagination is handled using:

```text
page
limit
```

Example:

```text
?page=2&limit=20
```

The response includes:

```json
{
  "meta": {
    "page": 2,
    "limit": 20,
    "totalCount": 47,
    "totalPages": 3
  }
}
```

The service calculates:

```text
skip = (page - 1) × limit
```

This keeps pagination logic predictable and database-driven.

---

# ↕️ Sorting

Sorting is dynamically supported.

Example:

```text
?page=1&limit=20&sortBy=createdAt&sortDirection=desc
```

Possible sorting fields can include:

```text
createdAt
updatedAt
name
email
```

depending on the validation rules configured by the application.

---

# 🛡️ Validation & Error Handling

The API validates query parameters and request bodies before constructing database queries.

Validation prevents malformed requests such as:

```text
page = -1
limit = invalid
sortDirection = random
```

Unsupported filter conditions are rejected instead of silently producing incorrect queries.

Unknown custom fields are also handled explicitly.

For example, a request using:

```json
{
  "fieldId": "does-not-exist"
}
```

does not get converted into a PostgreSQL UUID error.

The service handles the invalid custom-field reference at the application layer.

---

# 🔒 Security Considerations

The project is designed around several important backend security principles.

### Tenant Isolation

Every query begins with tenant visibility.

```text
tenantId = currentUser.tenantId
```

This ensures that filters cannot be used to escape the current tenant boundary.

### Authorization Before Filtering

Visibility rules are applied independently from user-provided filters.

This prevents a malicious filter from bypassing role-based restrictions.

### Runtime Validation

TypeScript provides compile-time safety, while Zod provides runtime validation for external input.

This distinction is important because HTTP request data cannot be trusted merely because TypeScript types exist.

### Parameterized Database Access

Prisma handles database query parameterization rather than constructing raw SQL strings from user input.

---

# 🗃️ Database Design

The project uses PostgreSQL with Prisma.

Core entities:

```text
Tenant
   │
   ├── User
   │
   ├── Lead
   │
   └── CustomField
           │
           ▼
   LeadCustomFieldValue
```

### Tenant

Represents an isolated customer/account.

### User

Belongs to a tenant and has a role.

### Lead

Represents the CRM lead.

### CustomField

Defines dynamic fields for a tenant.

Example:

```text
City
Industry
```

### LeadCustomFieldValue

Stores the actual value of a custom field for a lead.

Example:

```text
Lead ID
Field ID → City
Value → Salem
```

---

# 🧪 Testing Strategy

The API should be tested against both successful and failure scenarios.

Recommended test matrix:

| Scenario              | Expected Result                 |
| --------------------- | ------------------------------- |
| No filters            | All visible tenant leads        |
| Search by name        | Matching leads                  |
| Search by phone       | Matching leads                  |
| Search by email       | Matching leads                  |
| System field filter   | Correct filtered leads          |
| Custom field filter   | Correct EAV matches             |
| Multiple AND filters  | All conditions required         |
| Multiple OR filters   | Any condition accepted          |
| Empty date filter     | Leads with `NULL` date          |
| Non-empty date filter | Leads with date                 |
| Unknown custom field  | Controlled application error    |
| Invalid UUID          | Validation/error response       |
| Unknown tenant        | No unauthorized data            |
| Agent visibility      | Only authorized leads           |
| Pagination            | Correct page and metadata       |
| Sorting               | Correct order                   |
| No matching records   | Empty `data` array + zero count |

---

# 🧪 Example Test Cases

### Test 1 — Get all visible leads

```http
GET /api/v1/leads/query?page=1&limit=20
```

Body:

```json
{
  "logic": "AND",
  "filters": []
}
```

---

### Test 2 — Search for Vijay

```json
{
  "q": "Vijay",
  "logic": "AND",
  "filters": []
}
```

Expected:

```text
Vijay Kumar
```

---

### Test 3 — Filter City = Salem

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "CITY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Salem"
    }
  ]
}
```

Expected:

```text
Vijay Kumar
```

---

### Test 4 — Filter Industry = Finance

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "INDUSTRY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Finance"
    }
  ]
}
```

---

### Test 5 — Multiple custom filters

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "CITY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Salem"
    },
    {
      "fieldId": "INDUSTRY_FIELD_ID",
      "fieldType": "string",
      "condition": "is",
      "value": "Finance"
    }
  ]
}
```

Conceptually:

```text
City = Salem
AND
Industry = Finance
```

---

# ⚙️ Engineering Decisions

## Why PostgreSQL?

CRM data is highly relational.

Leads, users, tenants, custom fields, and assignments have strong relationships, making PostgreSQL a natural fit.

---

## Why Prisma?

Prisma provides:

* Strong TypeScript integration
* Type-safe queries
* Schema management
* Clear database models
* Reduced raw SQL usage

---

## Why Zod?

TypeScript types disappear at runtime.

HTTP input, however, exists at runtime.

Zod bridges that gap:

```text
HTTP Request
     │
     ▼
Zod Validation
     │
     ▼
Typed Application Logic
     │
     ▼
Prisma
```

---

## Why EAV for Custom Fields?

A traditional schema would require adding a column every time a tenant creates a new field.

For example:

```text
ALTER TABLE leads ADD COLUMN city...
ALTER TABLE leads ADD COLUMN industry...
ALTER TABLE leads ADD COLUMN budget...
```

This becomes difficult to maintain for a customizable CRM.

EAV instead stores the field definition and value separately.

This allows new fields to be introduced without changing the `Lead` table structure.

---

# ⚠️ EAV Trade-Offs

EAV provides flexibility, but it also introduces complexity.

Advantages:

* Highly dynamic
* Tenant-specific fields
* No schema migration for every custom field
* Good fit for configurable CRM systems

Trade-offs:

* More complicated queries
* More joins/subqueries
* Type handling becomes application responsibility
* Indexing requires careful planning
* Aggregations can be more expensive

For a configurable CRM, the flexibility can justify this complexity.

---

# 📈 Performance Considerations

The service already avoids loading unrelated custom-field values by first retrieving matching lead IDs and then hydrating only the returned leads.

Conceptually:

```text
Query Leads
    │
    ▼
Get Lead IDs
    │
    ▼
Fetch Custom Values for those IDs
    │
    ▼
Hydrate Response
```

This prevents loading every custom-field value in the database for every request.

For larger production datasets, additional optimizations could include:

* Composite indexes
* Cursor-based pagination
* Query plan analysis
* Dedicated search indexes
* PostgreSQL full-text search
* Materialized views for complex reporting
* Redis caching for frequently repeated queries
* Optimized EAV indexes

---

# 🔮 Future Improvements

Potential production enhancements:

* JWT authentication
* Refresh-token flow
* API rate limiting
* OpenAPI / Swagger documentation
* Automated integration tests
* Dockerized development environment
* CI/CD pipeline
* PostgreSQL query-plan monitoring
* Cursor-based pagination
* Advanced date operators
* Numeric custom-field comparisons
* Boolean custom-field filters
* Custom-field sorting
* Full-text search
* Redis caching
* Audit logging
* Request tracing
* Structured logging
* Metrics and observability
* Automated database migrations

---

# 📌 API Design Philosophy

The service follows a few core backend principles:

```text
Validate input
      ↓
Authenticate request
      ↓
Apply tenant isolation
      ↓
Apply role visibility
      ↓
Build query conditions
      ↓
Execute database query
      ↓
Hydrate dynamic fields
      ↓
Return predictable response
```

The goal is to keep each responsibility isolated rather than building one large query function.

---

# 🧑‍💻 Development Workflow

Recommended workflow:

```bash
git status

git add .

git commit -m "Describe the change"

git status
```

Keep commits focused around one logical change.

Examples:

```text
Initialize backend project
Add Prisma database schema
Add seed data
Implement authentication middleware
Add lead visibility rules
Add query parameter validation
Implement system lead filters
Implement custom EAV filtering
Add search support
Add pagination and sorting
Handle invalid custom fields
Complete lead query API
```

---

# 🎯 What This Project Demonstrates

This project is intentionally more than a basic CRUD API.

It demonstrates practical backend engineering concepts:

* REST API design
* TypeScript
* Express architecture
* PostgreSQL
* Prisma ORM
* Runtime validation
* Multi-tenancy
* Authorization
* Dynamic query construction
* EAV database modeling
* Search
* Pagination
* Sorting
* AND / OR query logic
* Error handling
* Data hydration
* Separation of concerns
* Database-aware API design

---

# 📄 License

This project is intended for educational and portfolio purposes.

Add a license appropriate for your repository before using this project commercially.

---

## 👨‍💻 Author

**Deepak**

B.Tech Information Technology

Built as a backend engineering project focused on **multi-tenant data access, dynamic querying, and scalable API design**.
