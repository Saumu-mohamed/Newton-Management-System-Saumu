# Frontend/Backend Refactor Guide

## Move this logic to the backend

### Approvals

- approval eligibility rules
- approve/reject side effects
- prerequisite and registration workflow rules
- allowed transitions between states
- audit logging for reviewer actions

### Finance

- totals and aggregates
- revenue trend calculations
- payment status normalization
- overdue and clearance logic
- chart datasets and summary cards

### Student academics

- GPA and CGPA computation
- class standing derivation
- semester filtering and result summaries
- unit credit totals
- result publication visibility rules

## Thin frontend rule

Frontend should only:

- request a backend view model
- render loading, success, and error states
- submit user intent such as approve, reject, pay, or filter
- display backend-derived statuses and labels

Frontend should not:

- recompute KPIs
- infer workflow state
- decide whether an action is valid
- derive academic or finance classifications

## Recommended endpoint design

### Approvals

- `GET /api/approvals/queue?status=pending&type=registration`
- `GET /api/approvals/:approvalId`
- `POST /api/approvals/:approvalId/approve`
- `POST /api/approvals/:approvalId/reject`

Response shape:

```json
{
  "stats": {
    "pending": 18,
    "approvedToday": 9,
    "rejectedToday": 2
  },
  "items": []
}
```

### Finance dashboard

- `GET /api/finance/dashboard`
- `GET /api/finance/payments?status=failed&method=mpesa&date=2026-04-07`
- `GET /api/finance/reports/collection-trend?range=6m`

Response shape:

```json
{
  "summary": {
    "totalRevenue": 0,
    "todayCollection": 0,
    "pendingTransactions": 0,
    "overdueStudents": 0
  },
  "charts": {
    "collectionTrend": [],
    "paymentMethods": [],
    "facultyCollection": []
  },
  "tables": {
    "recentTransactions": [],
    "partialPayments": []
  }
}
```

### Student academic data

- `GET /api/students/results`
- `GET /api/students/results?semester=Semester%202`
- `GET /api/students/dashboard`

Response shape:

```json
{
  "summary": {
    "currentGpa": 0,
    "cgpa": 0,
    "classStanding": "Second Class Upper",
    "totalCredits": 0
  },
  "semesterOptions": [],
  "currentResults": [],
  "academicHistory": [],
  "currentUnits": []
}
```

## Scalable backend structure

```text
Node/
  controllers/
    approvalController.js
    financeController.js
    studentController.js
  services/
    approvalService.js
    collegeAdminDashboardService.js
    financeDashboardService.js
    lecturerDashboardService.js
    registratorDashboardService.js
    studentResultsService.js
    superAdminDashboardService.js
  routes/
    approvalRoutes.js
    financeRoute.js
    studentRoutes.js
  models/
  middleware/
  utils/
  validators/
```

## Best practices

- controllers should orchestrate request and response only
- services should own business logic and data composition
- validators should sanitize and validate payloads before services run
- backend responses should be shaped for screens, not raw collections
- frontend components should avoid `reduce`, workflow branching, and status derivation for domain rules
- dashboard controllers should delegate to dedicated service builders that return dashboard view models
