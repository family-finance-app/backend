# Authentication API Documentation

## Get Current User Information

Returns information about the currently authenticated user.

### Endpoint

```
GET /auth/me
```

### Authentication

Requires a valid JWT access token in the Authorization header.

### Headers

```
Authorization: Bearer <access_token>
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "User data retrieved successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "createdAt": "2025-10-20T10:30:00.000Z",
    "updatedAt": "2025-10-20T10:30:00.000Z"
  }
}
```

### Error Responses

**Status Code:** `401 Unauthorized`

No token provided:

```json
{
  "statusCode": 401,
  "message": "Access token is required"
}
```

Invalid or expired token:

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

User not found:

```json
{
  "statusCode": 401,
  "message": "User not found"
}
```

### Example Usage

#### cURL

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const data = await response.json();
console.log(data.user);
```

#### Axios

```javascript
const response = await axios.get('http://localhost:3000/api/auth/me', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

console.log(response.data.user);
```

### Implementation Details

1. **JWT Guard**: The endpoint is protected by `JwtAuthGuard` which validates the JWT token
2. **Token Extraction**: Token is extracted from the `Authorization: Bearer <token>` header
3. **User Extraction**: User ID is extracted from the JWT payload (`sub` field)
4. **Database Query**: User data is fetched from the database using the user ID
5. **Response**: User information is returned (excluding sensitive data like password hash)

### Flow Diagram

```
Client Request
    ↓
Authorization Header Check
    ↓
JWT Token Validation
    ↓
Extract User ID from Token
    ↓
Query Database for User
    ↓
Return User Data
```

### Security Notes

- The access token expires in 5 minutes
- Sensitive data (password hash) is never returned
- Token must be valid and not expired
- User must exist in the database
