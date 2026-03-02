# API Documentation - Phase 3

All endpoints require authentication (NextAuth JWT token in cookies).

## Authentication

### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-03-02T00:00:00Z"
}
```

---

## Push-ups

### GET `/api/pushups`
Get all push-up entries for the current user (paginated).

**Query Parameters:**
- `take` (default: 30, max: 100) - Number of entries to return
- `skip` (default: 0) - Number of entries to skip

**Response:** `200 OK`
```json
{
  "entries": [
    {
      "id": 1,
      "count": 20,
      "date": "2026-03-02T00:00:00Z",
      "userId": 1,
      "createdAt": "2026-03-02T10:00:00Z",
      "updatedAt": "2026-03-02T10:00:00Z"
    }
  ],
  "total": 45,
  "hasMore": true
}
```

### POST `/api/pushups`
Create a new push-up entry.

**Request:**
```json
{
  "count": 20,
  "date": "2026-03-02"  // optional, defaults to today
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "count": 20,
  "date": "2026-03-02T00:00:00Z",
  "userId": 1,
  "createdAt": "2026-03-02T10:00:00Z",
  "updatedAt": "2026-03-02T10:00:00Z"
}
```

### GET `/api/pushups/today`
Get all push-up entries for today.

**Response:** `200 OK`
```json
{
  "entries": [
    {
      "id": 1,
      "count": 20,
      "date": "2026-03-02T00:00:00Z",
      "userId": 1,
      "createdAt": "2026-03-02T10:00:00Z",
      "updatedAt": "2026-03-02T10:00:00Z"
    }
  ],
  "totalCount": 20,
  "date": "2026-03-02T00:00:00Z"
}
```

### PUT `/api/pushups/[id]`
Update a push-up entry.

**Request:**
```json
{
  "count": 25
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "count": 25,
  "date": "2026-03-02T00:00:00Z",
  "userId": 1,
  "createdAt": "2026-03-02T10:00:00Z",
  "updatedAt": "2026-03-02T10:00:00Z"
}
```

### DELETE `/api/pushups/[id]`
Delete a push-up entry.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Groups

### GET `/api/groups`
Get all groups the current user is a member of.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Morning Crew",
    "inviteCode": "ABCD1234",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-03-01T00:00:00Z",
    "members": [
      {
        "id": 1,
        "userId": 1,
        "groupId": 1,
        "role": "owner",
        "createdAt": "2026-03-01T00:00:00Z",
        "updatedAt": "2026-03-01T00:00:00Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "_count": {
      "members": 1
    }
  }
]
```

### POST `/api/groups`
Create a new group.

**Request:**
```json
{
  "name": "Morning Crew"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Morning Crew",
  "inviteCode": "ABCD1234",
  "createdAt": "2026-03-01T00:00:00Z",
  "updatedAt": "2026-03-01T00:00:00Z",
  "members": [
    {
      "id": 1,
      "userId": 1,
      "groupId": 1,
      "role": "owner",
      "createdAt": "2026-03-01T00:00:00Z",
      "updatedAt": "2026-03-01T00:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### POST `/api/groups/join`
Join a group using an invite code.

**Request:**
```json
{
  "inviteCode": "ABCD1234"
}
```

**Response:** `201 Created` - Returns full group object

### GET `/api/groups/[id]`
Get group details (if member).

**Response:** `200 OK` - Returns full group object with members

### GET `/api/groups/[id]/members`
Get all members of a group.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "userId": 1,
    "groupId": 1,
    "role": "owner",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-03-01T00:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### DELETE `/api/groups/[id]/members`
Remove a member from a group (or leave the group).

**Query Parameters:**
- `memberId` (optional) - ID of member to remove. If not provided, removes current user.

**Response:** `200 OK`
```json
{
  "message": "Successfully removed member"
}
```

### GET `/api/groups/[id]/leaderboard`
Get group leaderboard for a time period.

**Query Parameters:**
- `period` (default: "week") - "today", "week", or "month"

**Response:** `200 OK`
```json
{
  "period": "week",
  "startDate": "2026-03-02T00:00:00Z",
  "leaderboard": [
    {
      "userId": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "totalPushups": 150,
      "entriesCount": 7
    },
    {
      "userId": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "totalPushups": 120,
      "entriesCount": 6
    }
  ]
}
```

### DELETE `/api/groups/[id]/leave`
Leave a group.

**Response:** `200 OK`
```json
{
  "message": "Successfully left the group"
}
```

---

## Statistics

### GET `/api/stats/personal`
Get personal push-up statistics for the last 30 days.

**Response:** `200 OK`
```json
{
  "2026-03-01": 20,
  "2026-03-02": 25,
  "2026-03-03": 30
}
```

### GET `/api/stats/group/[id]`
Get group statistics (all members' stats for last 30 days and 12 weeks).

**Response:** `200 OK`
```json
[
  {
    "userId": 1,
    "name": "John Doe",
    "daily": [
      {
        "date": "2026-03-01",
        "count": 20
      },
      {
        "date": "2026-03-02",
        "count": 25
      }
    ],
    "weekly": [
      {
        "week": "2026-02-23",
        "count": 140
      },
      {
        "week": "2026-03-02",
        "count": 75
      }
    ]
  }
]
```

---

## Error Responses

All errors return appropriate HTTP status codes with error messages:

```json
{
  "error": "Error description"
}
```

**Common Status Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for this resource)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Note

All endpoints (except `/api/auth/register`) require a valid NextAuth session. The session is automatically managed via HTTP-only cookies. Include credentials in client requests:

```javascript
const response = await fetch('/api/pushups', {
  credentials: 'include'  // Important: include cookies
});
```
