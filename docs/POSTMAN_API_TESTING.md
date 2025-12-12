# Postman API Testing Guide - Bookings & Confirmation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication. You'll need to:
1. Log in through the web interface first
2. Copy the session cookie from browser DevTools
3. Add it to Postman requests

---

## 1. Get All Bookings

**Endpoint:** `GET /bookings`

**Description:** Fetch all bookings for the authenticated user

**Headers:**
```
Cookie: better-auth.session_token=<your-session-token>
```

**Request:**
```http
GET http://localhost:3000/api/bookings
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pnr": "PNR000001",
      "userId": "user-uuid",
      "flightId": 1,
      "airlineId": 1,
      "amountPaid": "598.00",
      "paymentStatus": "paid",
      "bookingStatus": "confirmed",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## 2. Create Booking

**Endpoint:** `POST /bookings`

**Description:** Create a new flight booking

**Headers:**
```
Content-Type: application/json
Cookie: better-auth.session_token=<your-session-token>
```

**Request Body:**
```json
{
  "flightId": "1",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@example.com",
      "phone": "+1234567891"
    }
  ],
  "paymentInfo": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingId": 123,
    "pnr": "PNR000123",
    "status": "confirmed",
    "totalAmount": 598,
    "passengersCount": 2
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400) - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking data",
    "details": {
      "passengers": {
        "_errors": ["Expected array, received string"]
      }
    }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "retryable": false
  }
}
```

**Error Response (400) - Not Enough Seats:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Not enough available seats"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "retryable": false
  }
}
```

**Error Response (404) - Flight Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Flight not found"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "retryable": false
  }
}
```

---

## 3. Get Booking by PNR

**Endpoint:** `GET /bookings/{pnr}`

**Description:** Fetch a specific booking by PNR

**Headers:**
```
Cookie: better-auth.session_token=<your-session-token>
```

**Request:**
```http
GET http://localhost:3000/api/bookings/PNR000123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pnr": "PNR000123",
    "flightId": 1,
    "passengers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    ],
    "status": "confirmed"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

---

## 4. Confirm Booking

**Endpoint:** `POST /bookings/{pnr}/confirm`

**Description:** Confirm a pending booking

**Headers:**
```
Content-Type: application/json
Cookie: better-auth.session_token=<your-session-token>
```

**Request:**
```http
POST http://localhost:3000/api/bookings/PNR000123/confirm
```

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pnr": "PNR000123",
    "status": "confirmed"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## 5. Update Payment Status

**Endpoint:** `POST /bookings/{pnr}/payment`

**Description:** Update payment status for a booking

**Headers:**
```
Content-Type: application/json
Cookie: better-auth.session_token=<your-session-token>
```

**Request:**
```http
POST http://localhost:3000/api/bookings/PNR000123/payment
```

**Request Body:**
```json
{
  "paymentMethod": "credit-card"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pnr": "PNR000123",
    "paymentStatus": "paid"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Supporting APIs

### Get Flights

**Endpoint:** `GET /flights`

**Request:**
```http
GET http://localhost:3000/api/flights
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "flightNumber": "FL-6",
      "airline": "Bamboo Airways",
      "origin": "Phú Quốc (PQC)",
      "destination": "Nội Bài (HAN)",
      "departureTime": "09:20:00",
      "arrivalTime": "11:30:00",
      "duration": "2h 10m",
      "price": 299,
      "seatsRemaining": 45
    }
  ]
}
```

### Get Seats for Flight

**Endpoint:** `GET /seats?flightId={flightId}`

**Request:**
```http
GET http://localhost:3000/api/seats?flightId=1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "seat_number": "1A",
      "class": "business",
      "is_available": true,
      "price": "150.00"
    },
    {
      "id": 2,
      "seat_number": "1B",
      "class": "business",
      "is_available": false,
      "price": "150.00"
    }
  ]
}
```

---

## Postman Collection JSON

Save this as `booking-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Flight Booking API",
    "description": "API collection for testing flight booking system",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api",
      "type": "string"
    },
    {
      "key": "sessionToken",
      "value": "your-session-token-here",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Bookings",
      "item": [
        {
          "name": "Get All Bookings",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Cookie",
                "value": "better-auth.session_token={{sessionToken}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/bookings",
              "host": ["{{baseUrl}}"],
              "path": ["bookings"]
            }
          }
        },
        {
          "name": "Create Booking",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json",
                "type": "text"
              },
              {
                "key": "Cookie",
                "value": "better-auth.session_token={{sessionToken}}",
                "type": "text"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"flightId\": \"1\",\n  \"passengers\": [\n    {\n      \"firstName\": \"John\",\n      \"lastName\": \"Doe\",\n      \"email\": \"john.doe@example.com\",\n      \"phone\": \"+1234567890\"\n    }\n  ],\n  \"paymentInfo\": {\n    \"cardNumber\": \"4111111111111111\",\n    \"expiryDate\": \"12/25\",\n    \"cvv\": \"123\"\n  }\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/bookings",
              "host": ["{{baseUrl}}"],
              "path": ["bookings"]
            }
          }
        },
        {
          "name": "Get Booking by PNR",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Cookie",
                "value": "better-auth.session_token={{sessionToken}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/bookings/PNR000001",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "PNR000001"]
            }
          }
        },
        {
          "name": "Confirm Booking",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json",
                "type": "text"
              },
              {
                "key": "Cookie",
                "value": "better-auth.session_token={{sessionToken}}",
                "type": "text"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{}"
            },
            "url": {
              "raw": "{{baseUrl}}/bookings/PNR000001/confirm",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "PNR000001", "confirm"]
            }
          }
        },
        {
          "name": "Update Payment",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json",
                "type": "text"
              },
              {
                "key": "Cookie",
                "value": "better-auth.session_token={{sessionToken}}",
                "type": "text"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"paymentMethod\": \"credit-card\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/bookings/PNR000001/payment",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "PNR000001", "payment"]
            }
          }
        }
      ]
    },
    {
      "name": "Flights",
      "item": [
        {
          "name": "Get All Flights",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/flights",
              "host": ["{{baseUrl}}"],
              "path": ["flights"]
            }
          }
        },
        {
          "name": "Get Flight by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/flights/1",
              "host": ["{{baseUrl}}"],
              "path": ["flights", "1"]
            }
          }
        }
      ]
    },
    {
      "name": "Seats",
      "item": [
        {
          "name": "Get Seats by Flight",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/seats?flightId=1",
              "host": ["{{baseUrl}}"],
              "path": ["seats"],
              "query": [
                {
                  "key": "flightId",
                  "value": "1"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

---

## How to Get Session Token

### Method 1: Browser DevTools

1. Log in to the application at `http://localhost:3000`
2. Open Browser DevTools (F12)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Navigate to **Cookies** → `http://localhost:3000`
5. Find cookie named `better-auth.session_token`
6. Copy the value
7. Paste it in Postman as: `better-auth.session_token=<copied-value>`

### Method 2: Network Tab

1. Log in to the application
2. Open DevTools → **Network** tab
3. Make any authenticated request (e.g., go to My Bookings)
4. Click on the request
5. Go to **Headers** section
6. Find **Request Headers** → **Cookie**
7. Copy the entire cookie string
8. Paste it in Postman

---

## Testing Workflow

### 1. Setup
```bash
# Start the development server
npm run dev

# Reset and seed database
npm run db:reset
```

### 2. Get Session Token
- Log in through the web interface
- Copy session token from browser

### 3. Test Sequence

**Step 1: Get Available Flights**
```http
GET http://localhost:3000/api/flights
```

**Step 2: Get Seats for a Flight**
```http
GET http://localhost:3000/api/seats?flightId=1
```

**Step 3: Create a Booking**
```http
POST http://localhost:3000/api/bookings
Content-Type: application/json
Cookie: better-auth.session_token=<your-token>

{
  "flightId": "1",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    }
  ],
  "paymentInfo": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

**Step 4: Get All Bookings**
```http
GET http://localhost:3000/api/bookings
Cookie: better-auth.session_token=<your-token>
```

**Step 5: Get Booking by PNR**
```http
GET http://localhost:3000/api/bookings/PNR000001
Cookie: better-auth.session_token=<your-token>
```

---

## Common Test Scenarios

### Scenario 1: Successful Booking
1. Get available flights
2. Select a flight with available seats
3. Create booking with valid data
4. Verify booking is created
5. Check booking appears in list

### Scenario 2: Validation Error
1. Try to create booking with invalid email
2. Expect 400 error with validation details

### Scenario 3: Not Enough Seats
1. Find a flight with 1 seat remaining
2. Try to book 2 passengers
3. Expect 400 error "Not enough available seats"

### Scenario 4: Flight Not Found
1. Try to create booking with non-existent flightId
2. Expect 404 error "Flight not found"

### Scenario 5: Unauthorized Access
1. Remove session token
2. Try to get bookings
3. Expect 401 error "Authentication required"

---

## Environment Variables for Postman

Create an environment with these variables:

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:3000/api` |
| `sessionToken` | `<your-session-token>` |
| `flightId` | `1` |
| `pnr` | `PNR000001` |

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** 
- Ensure you're logged in
- Copy fresh session token
- Check cookie name is correct

### Issue: 404 Not Found
**Solution:**
- Verify the endpoint URL
- Check if resource exists in database
- Ensure server is running

### Issue: 400 Validation Error
**Solution:**
- Check request body matches schema
- Verify all required fields are present
- Check data types are correct

### Issue: 500 Internal Server Error
**Solution:**
- Check server logs
- Verify database is running
- Check database connection string

---

## Additional Resources

- **API Documentation:** `docs/API_BOOKING_EXAMPLES.md`
- **Feature Structure:** `docs/FEATURE_MODULE_STRUCTURE.md`
- **Testing Guide:** `docs/TESTING_BOOKING_FLOW.md`
