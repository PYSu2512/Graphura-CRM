# SUPPORT TICKET SYSTEM — Complete API Documentation
## Production-Level Backend for Graphura CRM

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Hierarchy & Escalation Flow](#hierarchy--escalation-flow)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)
7. [Testing Guide](#testing-guide)

---

## 🎯 SYSTEM OVERVIEW

### What is Implemented?

A **production-level support ticket system** with hierarchical escalation. The system allows employees and managers at all levels to raise support tickets that automatically route to the appropriate handler based on organizational hierarchy.

### Key Features

✅ **Automatic Assignment** - Tickets auto-assign to the correct level based on hierarchy  
✅ **Hierarchical Escalation** - Move tickets up the chain when needed  
✅ **Role-Based Access** - Users see only their tickets (or all if Admin)  
✅ **Multiple Replies** - Track conversation history with timestamps  
✅ **Status Tracking** - OPEN → IN_PROGRESS → RESOLVED → CLOSED  
✅ **Priority Management** - LOW, NORMAL, HIGH, URGENT  
✅ **Audit Logging** - All actions tracked for compliance  
✅ **Push Notifications** - Real-time alerts for assignments & escalations  
✅ **Statistics Dashboard** - Ticket metrics by status, priority, department  

---

## 🔄 HIERARCHY & ESCALATION FLOW

### SALES DEPARTMENT

```
SALES_EXECUTIVE
    ↓ (raises ticket)
    ↓ (auto-assigned to)
SALES_TL
    ↓ (if escalates)
    ↓ (moves to)
SALES_MANAGER
    ↓ (if escalates)
    ↓ (moves to)
ADMIN
    ↓ (if escalates)
    ↓ (moves to)
SUPER_ADMIN (via SuperAdminTicket)
```

### FINANCE DEPARTMENT

```
FINANCE_EXECUTIVE
    ↓ (auto-assigned to)
FINANCE_MANAGER
    ↓ (if escalates)
ADMIN
    ↓ (if escalates)
SUPER_ADMIN
```

### MANAGEMENT DEPARTMENT

```
MANAGEMENT_EMPLOYEE
    ↓ (auto-assigned to)
MANAGEMENT_TL
    ↓ (if escalates)
MANAGEMENT_MANAGER
    ↓ (if escalates)
ADMIN
    ↓ (if escalates)
SUPER_ADMIN
```

### Admin & Super Admin

- **Admin raises ticket** → Auto-assigned to SUPER_ADMIN via SuperAdminTicket model
- **Super Admin** → Handles SuperAdminTicket (separate collection)

---

## 📡 API ENDPOINTS

### BASE URL
```
http://localhost:3000/api/support-tickets
```

### AUTHENTICATION
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

### 1️⃣ CREATE TICKET
**Endpoint:** `POST /api/support-tickets`  
**Auth:** Required (Any authenticated user)  
**Description:** Create a new support ticket. Auto-assigns to next level in hierarchy.

**Request Body:**
```json
{
  "subject": "Dashboard performance is slow",
  "message": "The sales dashboard takes 10+ seconds to load. Please investigate.",
  "priority": "HIGH",
  "refType": null,
  "refId": null
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "data": {
    "ticket": {
      "_id": "65f123abc...",
      "admin": "user_admin_id",
      "raisedBy": {
        "_id": "user_id",
        "name": "John Smith",
        "email": "john@company.com",
        "role": "SALES_EXECUTIVE"
      },
      "assignedTo": {
        "_id": "tl_id",
        "name": "Sarah Manager",
        "email": "sarah@company.com",
        "role": "SALES_TL"
      },
      "subject": "Dashboard performance is slow",
      "message": "The sales dashboard takes 10+ seconds to load...",
      "status": "OPEN",
      "priority": "HIGH",
      "isEscalated": false,
      "escalatedAt": null,
      "resolvedAt": null,
      "resolvedBy": null,
      "replies": [],
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedAt": "2024-03-15T10:30:00Z"
    }
  },
  "message": "Support ticket created successfully"
}
```

---

### 2️⃣ GET ALL TICKETS
**Endpoint:** `GET /api/support-tickets`  
**Auth:** Required  
**Description:** Fetch all tickets with filtering & pagination

**Query Parameters:**
```
status=OPEN|IN_PROGRESS|RESOLVED|CLOSED|ESCALATED
priority=LOW|NORMAL|HIGH|URGENT
assignedTo=<userId>  (admin only)
sortBy=createdAt|priority|escalatedAt
page=1 (default)
limit=20 (default, max 100)
showEscalated=true|false
```

**Example Request:**
```
GET /api/support-tickets?status=OPEN&priority=HIGH&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "tickets": [
      {
        "_id": "65f123abc...",
        "raisedBy": {
          "_id": "user_id",
          "name": "John Smith",
          "email": "john@company.com",
          "role": "SALES_EXECUTIVE"
        },
        "assignedTo": {
          "_id": "tl_id",
          "name": "Sarah Manager",
          "email": "sarah@company.com",
          "role": "SALES_TL"
        },
        "subject": "Dashboard performance issue",
        "status": "OPEN",
        "priority": "HIGH",
        "isEscalated": false,
        "createdAt": "2024-03-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  },
  "message": "Tickets fetched successfully"
}
```

---

### 3️⃣ GET TICKET BY ID
**Endpoint:** `GET /api/support-tickets/:ticketId`  
**Auth:** Required  
**Description:** Fetch a single ticket with full details & reply history

**Example Request:**
```
GET /api/support-tickets/65f123abc...
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "ticket": {
      "_id": "65f123abc...",
      "admin": "admin_id",
      "raisedBy": {
        "_id": "user_id",
        "name": "John Smith",
        "email": "john@company.com",
        "role": "SALES_EXECUTIVE",
        "department": "Sales"
      },
      "assignedTo": {
        "_id": "tl_id",
        "name": "Sarah Manager",
        "email": "sarah@company.com",
        "role": "SALES_TL",
        "department": "Sales"
      },
      "subject": "Dashboard performance issue",
      "message": "The sales dashboard takes 10+ seconds to load...",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "isEscalated": false,
      "escalatedAt": null,
      "resolvedAt": null,
      "resolvedBy": null,
      "replies": [
        {
          "user": {
            "_id": "tl_id",
            "name": "Sarah Manager",
            "email": "sarah@company.com",
            "role": "SALES_TL"
          },
          "message": "I'm looking into the database queries causing the slowdown.",
          "createdAt": "2024-03-15T11:00:00Z"
        }
      ],
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedAt": "2024-03-15T11:00:00Z"
    }
  },
  "message": "Ticket fetched successfully"
}
```

---

### 4️⃣ ADD REPLY
**Endpoint:** `POST /api/support-tickets/:ticketId/reply`  
**Auth:** Required  
**Description:** Add a reply/comment to ticket

**Request Body:**
```json
{
  "message": "I've identified the issue. It's due to missing database indexes. Working on a fix now."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "ticket": {
      ...ticket_data,
      "replies": [
        {
          "user": {
            "_id": "tl_id",
            "name": "Sarah Manager",
            "email": "sarah@company.com"
          },
          "message": "I've identified the issue...",
          "createdAt": "2024-03-15T11:30:00Z"
        }
      ]
    }
  },
  "message": "Reply added successfully"
}
```

---

### 5️⃣ ESCALATE TICKET
**Endpoint:** `POST /api/support-tickets/:ticketId/escalate`  
**Auth:** Required (Current assignee or Admin)  
**Description:** Move ticket to next level in hierarchy

**Request Body:**
```json
{
  "escalationReason": "This requires manager-level decision. Customer is VIP and needs quick resolution."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "ticket": {
      "_id": "65f123abc...",
      "assignedTo": {
        "_id": "manager_id",
        "name": "Michael Brown",
        "email": "michael@company.com",
        "role": "SALES_MANAGER"
      },
      "status": "ESCALATED",
      "isEscalated": true,
      "escalatedAt": "2024-03-15T12:00:00Z",
      "replies": [
        {
          "message": "ESCALATION: This requires manager-level decision..."
        }
      ]
    },
    "escalatedTo": {
      "_id": "manager_id",
      "name": "Michael Brown",
      "email": "michael@company.com"
    }
  },
  "message": "Ticket escalated successfully"
}
```

---

### 6️⃣ RESOLVE TICKET
**Endpoint:** `POST /api/support-tickets/:ticketId/resolve`  
**Auth:** Required (Assignee or Admin)  
**Description:** Mark ticket as resolved with resolution details

**Request Body:**
```json
{
  "resolutionMessage": "Issue resolved by adding database indexes. Dashboard now loads in <2 seconds. Deployed to production."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "ticket": {
      "_id": "65f123abc...",
      "status": "RESOLVED",
      "resolvedAt": "2024-03-15T14:30:00Z",
      "resolvedBy": {
        "_id": "tl_id",
        "name": "Sarah Manager",
        "email": "sarah@company.com"
      },
      "replies": [
        {
          "user": {
            "_id": "tl_id",
            "name": "Sarah Manager"
          },
          "message": "Issue resolved by adding database indexes...",
          "createdAt": "2024-03-15T14:30:00Z"
        }
      ]
    }
  },
  "message": "Ticket resolved successfully"
}
```

---

### 7️⃣ CLOSE TICKET
**Endpoint:** `POST /api/support-tickets/:ticketId/close`  
**Auth:** Required (Admin only or Resolver)  
**Description:** Final closure of the ticket after resolution

**Request Body:**
```json
{
  "closureNotes": "Customer confirmed the fix works. Ticket can be closed."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "ticket": {
      "_id": "65f123abc...",
      "status": "CLOSED",
      "resolvedAt": "2024-03-15T14:30:00Z",
      "resolvedBy": {
        "_id": "tl_id",
        "name": "Sarah Manager"
      }
    }
  },
  "message": "Ticket closed successfully"
}
```

---

### 8️⃣ REASSIGN TICKET
**Endpoint:** `PUT /api/support-tickets/:ticketId/reassign`  
**Auth:** Required (Admin only)  
**Description:** Manually reassign ticket to another user

**Request Body:**
```json
{
  "assignedTo": "other_user_id",
  "reason": "Original assignee is on leave. Reassigning to backup."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "ticket": {
      "_id": "65f123abc...",
      "assignedTo": {
        "_id": "other_user_id",
        "name": "Alternative Handler",
        "email": "alt@company.com"
      },
      "status": "IN_PROGRESS"
    },
    "assignedTo": {
      "_id": "other_user_id",
      "name": "Alternative Handler",
      "email": "alt@company.com"
    }
  },
  "message": "Ticket reassigned successfully"
}
```

---

### 9️⃣ GET TICKET STATISTICS
**Endpoint:** `GET /api/support-tickets/stats`  
**Auth:** Required  
**Description:** Get dashboard statistics

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "stats": {
      "byStatus": [
        { "_id": "OPEN", "count": 15 },
        { "_id": "IN_PROGRESS", "count": 8 },
        { "_id": "RESOLVED", "count": 22 },
        { "_id": "CLOSED", "count": 20 },
        { "_id": "ESCALATED", "count": 3 }
      ],
      "byPriority": [
        { "_id": "URGENT", "count": 2 },
        { "_id": "HIGH", "count": 8 },
        { "_id": "NORMAL", "count": 40 },
        { "_id": "LOW", "count": 18 }
      ],
      "escalated": [
        { "total": 3 }
      ],
      "total": [
        { "total": 68 }
      ]
    }
  },
  "message": "Ticket statistics fetched successfully"
}
```

---

### 🔟 GET ASSIGNEE OPTIONS
**Endpoint:** `GET /api/support-tickets/assignees`  
**Auth:** Required  
**Description:** Get list of users that can be assigned tickets (for manual reassignment dropdown)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "assignees": [
      {
        "_id": "user1_id",
        "name": "Sarah Manager",
        "email": "sarah@company.com",
        "role": "SALES_TL"
      },
      {
        "_id": "user2_id",
        "name": "Michael Brown",
        "email": "michael@company.com",
        "role": "SALES_MANAGER"
      },
      {
        "_id": "user3_id",
        "name": "Finance Manager",
        "email": "finance@company.com",
        "role": "FINANCE_MANAGER"
      }
    ]
  },
  "message": "Assignee options fetched successfully"
}
```

---

## 📊 DATA MODELS

### Ticket Model (M35)

```javascript
{
  _id: ObjectId,
  admin: ObjectId (ref: Admin),               // Tenant scope
  raisedBy: ObjectId (ref: User),             // Who created the ticket
  assignedTo: ObjectId (ref: User),           // Current handler (auto-assigned or manual)
  
  // Ticket Content
  subject: String,                            // Title (5-200 chars)
  message: String,                            // Description (10-2000 chars)
  priority: String,                           // LOW|NORMAL|HIGH|URGENT
  status: String,                             // OPEN|IN_PROGRESS|RESOLVED|CLOSED|ESCALATED
  
  // Reference Data (optional)
  refType: String,                            // CLIENT_DATA|SALES_MANAGER|SYSTEM|etc
  refId: ObjectId,                            // Related entity ID
  
  // Conversation
  replies: [
    {
      user: ObjectId (ref: User),
      message: String,
      createdAt: Date,
      _id: false
    }
  ],
  
  // Escalation Tracking
  isEscalated: Boolean,                       // Has ticket been escalated?
  escalatedAt: Date,                          // When escalated
  
  // Resolution Tracking
  resolvedAt: Date,                           // When resolved
  resolvedBy: ObjectId (ref: User),           // Who resolved
  
  // Audit
  createdAt: Date,
  updatedAt: Date
}
```

### SuperAdminTicket Model (M36)

```javascript
{
  _id: ObjectId,
  raisedBy: ObjectId (ref: Admin),            // Admin raising ticket to SuperAdmin
  
  subject: String,
  message: String,
  priority: String,                           // LOW|NORMAL|HIGH|URGENT
  status: String,                             // OPEN|IN_PROGRESS|RESOLVED|CLOSED|ESCALATED
  
  replies: [
    {
      senderType: String,                     // ADMIN|SUPER_ADMIN
      senderId: ObjectId,
      message: String,
      createdAt: Date,
      _id: false
    }
  ],
  
  resolvedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ IMPLEMENTATION DETAILS

### Files Created/Modified

1. **Service** (`src/services/ticket.service.js`)
   - Business logic for ticket operations
   - Hierarchy determination
   - Escalation logic
   - Status management

2. **Controller** (`src/controllers/ticket.controller.js`)
   - API endpoint handlers
   - Request/response processing
   - Authorization checks
   - Error handling

3. **Validator** (`src/validators/ticket.validator.js`)
   - Input validation schemas
   - Joi-based validation
   - Error message customization

4. **Routes** (`src/routes/tickets.js`)
   - REST API endpoint definitions
   - Middleware application
   - Request documentation

5. **Notification Service** (`src/services/notification.service.js`)
   - In-app notifications
   - Push notifications (FCM-ready)
   - Email notifications (Brevo-ready)
   - Bulk notification support

6. **Server** (`src/server.js`)
   - Route registration
   - Import ticket routes

### Key Design Decisions

1. **Automatic Assignment**
   - When a ticket is created, it's immediately assigned to the next level
   - Uses role hierarchy to determine recipient
   - Fallback to null if no assignee at that level

2. **Escalation vs Reassignment**
   - **Escalation**: Moves ticket to next level in hierarchy (anyone can do)
   - **Reassignment**: Manual reassignment to any user (admin only)

3. **Status Flow**
   - OPEN → IN_PROGRESS → RESOLVED → CLOSED
   - ESCALATED can occur at any stage
   - No direct OPEN → RESOLVED (must go through IN_PROGRESS)

4. **Permissions Model**
   - **All users**: Can create tickets
   - **Raiser & Assignee**: Can add replies
   - **Assignee & Admin**: Can escalate, resolve, close
   - **Admin only**: Can reassign, view all tickets
   - **Non-admin**: Can only see their own tickets

5. **Notifications**
   - In-app notifications stored in database
   - Push notifications sent to FCM tokens (when available)
   - Email notifications (template-ready, awaiting Brevo setup)
   - Audit logs created for all significant actions

---

## 💡 USAGE EXAMPLES

### Example 1: Employee Raises Ticket → Auto-Assigned

```bash
# 1. Employee (SALES_EXECUTIVE) creates ticket
POST /api/support-tickets
{
  "subject": "CRM module crashes",
  "message": "When I try to add a new lead, the CRM crashes with error 500",
  "priority": "URGENT"
}

# Response: Auto-assigned to SALES_TL
# ✅ Ticket created with status OPEN
# ✅ Assigned to Team Leader automatically
# ✅ Notification sent to Team Leader
# ✅ Audit log created
```

### Example 2: Team Leader Escalates → Manager

```bash
# 2. Team Leader escalates the ticket
POST /api/support-tickets/65f123abc.../escalate
{
  "escalationReason": "This appears to be a backend issue requiring database investigation"
}

# Response: Moved to SALES_MANAGER
# ✅ Status changed to ESCALATED
# ✅ Assigned to Manager automatically
# ✅ Notification sent to Manager
```

### Example 3: Manager Resolves Ticket

```bash
# 3. Manager adds reply with solution
POST /api/support-tickets/65f123abc.../reply
{
  "message": "Fixed! Database connection pool was exhausted. Issue resolved in latest deployment."
}

# 4. Manager resolves
POST /api/support-tickets/65f123abc.../resolve
{
  "resolutionMessage": "Rolled out fix to production. Confirmed working."
}

# Response: Status changed to RESOLVED
# ✅ Resolved timestamp recorded
# ✅ Employee (raiser) notified
```

### Example 4: Employee Closes Ticket

```bash
# 5. Employee closes after confirming fix
POST /api/support-tickets/65f123abc.../close
{
  "closureNotes": "Confirmed fix works perfectly. Thank you!"
}

# Response: Status changed to CLOSED
# ✅ Ticket archived
# ✅ Final reply added
```

---

## 🧪 TESTING GUIDE

### Prerequisites

```bash
# Ensure you have:
# 1. Backend server running (npm start)
# 2. MongoDB connected
# 3. At least 2 users created (different roles)
# 4. Bearer tokens for both users
```

### Test Flow (in Postman/Insomnia)

#### Step 1: Create Ticket
```
POST http://localhost:3000/api/support-tickets
Authorization: Bearer <EXECUTIVE_TOKEN>

Body:
{
  "subject": "Test ticket for escalation",
  "message": "This is a test support ticket for the escalation flow",
  "priority": "HIGH"
}
```

#### Step 2: View Ticket
```
GET http://localhost:3000/api/support-tickets/65f123abc...
Authorization: Bearer <TL_TOKEN>
```

#### Step 3: Add Reply
```
POST http://localhost:3000/api/support-tickets/65f123abc.../reply
Authorization: Bearer <TL_TOKEN>

Body:
{
  "message": "I'm investigating this issue now"
}
```

#### Step 4: Escalate
```
POST http://localhost:3000/api/support-tickets/65f123abc.../escalate
Authorization: Bearer <TL_TOKEN>

Body:
{
  "escalationReason": "Needs manager approval to proceed"
}
```

#### Step 5: Get Stats
```
GET http://localhost:3000/api/support-tickets/stats
Authorization: Bearer <ADMIN_TOKEN>
```

---

## 🚀 NEXT STEPS FOR FRONTEND INTEGRATION

When you're ready to connect with frontend:

1. **Dashboard Component**
   - Display ticket count by status
   - Show escalated tickets first
   - Filter by priority/status

2. **Ticket List Component**
   - Pagination support
   - Real-time filtering
   - Sort options

3. **Ticket Detail Component**
   - Full ticket view
   - Reply thread
   - Action buttons (escalate, resolve, close, reassign)

4. **Create Ticket Form**
   - Subject & message fields
   - Priority selector
   - Auto-assignment indicator

5. **Notifications Integration**
   - Real-time notifications
   - Badge count
   - Toast notifications for updates

---

## ✅ PRODUCTION CHECKLIST

- ✅ Models created and indexed
- ✅ Service layer with business logic
- ✅ Controller with error handling
- ✅ Comprehensive validators
- ✅ Complete REST API routes
- ✅ Audit logging
- ✅ Notification system
- ✅ Documentation complete
- ⏳ Frontend integration (next phase)
- ⏳ End-to-end testing
- ⏳ Performance optimization (if needed)

---

**Status: READY FOR FRONTEND INTEGRATION** ✅
