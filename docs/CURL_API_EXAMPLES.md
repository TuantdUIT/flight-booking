# cURL API Examples - Quick Testing

## Setup

```bash
# Set your session token as environment variable
export SESSION_TOKEN="your-session-token-here"
export BASE_URL="http://localhost:3000/api"
```

---

## Bookings API

### 1. Get All Bookings

```bash
curl -X GET "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Create Booking (Single Passenger)

```bash
curl -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 3. Create Booking (Multiple Passengers)

```bash
curl -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 4. Get Booking by PNR

```bash
curl -X GET "$BASE_URL/bookings/PNR000001" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. Confirm Booking

```bash
curl -X POST "$BASE_URL/bookings/PNR000001/confirm" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 6. Update Payment Status

```bash
curl -X POST "$BASE_URL/bookings/PNR000001/payment" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "credit-card"
  }'
```

---

## Flights API

### 1. Get All Flights

```bash
curl -X GET "$BASE_URL/flights" \
  -H "Content-Type: application/json"
```

### 2. Get Flight by ID

```bash
curl -X GET "$BASE_URL/flights/1" \
  -H "Content-Type: application/json"
```

### 3. Search Flights

```bash
curl -X GET "$BASE_URL/flights/search?origin=HAN&destination=SGN&date=2024-12-20" \
  -H "Content-Type: application/json"
```

---

## Seats API

### 1. Get Seats for Flight

```bash
curl -X GET "$BASE_URL/seats?flightId=1" \
  -H "Content-Type: application/json"
```

### 2. Get Seat by ID

```bash
curl -X GET "$BASE_URL/seats/1" \
  -H "Content-Type: application/json"
```

---

## Passengers API

### 1. Create Passenger

```bash
curl -X POST "$BASE_URL/passengers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "dob": "1990-01-15",
    "nationality": "United States",
    "passport": "US123456789"
  }'
```

### 2. Get Passenger by ID

```bash
curl -X GET "$BASE_URL/passengers/1" \
  -H "Content-Type: application/json"
```

---

## Airlines API

### 1. Get All Airlines

```bash
curl -X GET "$BASE_URL/airlines" \
  -H "Content-Type: application/json"
```

---

## Airports API

### 1. Get All Airports

```bash
curl -X GET "$BASE_URL/airports" \
  -H "Content-Type: application/json"
```

### 2. Get Origins

```bash
curl -X GET "$BASE_URL/airports/origins" \
  -H "Content-Type: application/json"
```

### 3. Get Destinations

```bash
curl -X GET "$BASE_URL/airports/destinations" \
  -H "Content-Type: application/json"
```

---

## Pretty Print JSON (with jq)

If you have `jq` installed, pipe the output for better readability:

```bash
# Get all bookings with pretty print
curl -X GET "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Get flights with pretty print
curl -X GET "$BASE_URL/flights" \
  -H "Content-Type: application/json" | jq '.'
```

---

## Save Response to File

```bash
# Save booking response
curl -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d @booking-request.json \
  -o booking-response.json

# View the saved response
cat booking-response.json | jq '.'
```

---

## Test with Different Scenarios

### Scenario 1: Invalid Email

```bash
curl -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "1",
    "passengers": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "invalid-email",
        "phone": "+1234567890"
      }
    ],
    "paymentInfo": {
      "cardNumber": "4111111111111111",
      "expiryDate": "12/25",
      "cvv": "123"
    }
  }'
```

Expected: 400 Bad Request with validation error

### Scenario 2: Missing Required Field

```bash
curl -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "1",
    "passengers": [
      {
        "firstName": "John",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      }
    ],
    "paymentInfo": {
      "cardNumber": "4111111111111111",
      "expiryDate": "12/25",
      "cvv": "123"
    }
  }'
```

Expected: 400 Bad Request (missing lastName)

### Scenario 3: Non-existent Flight

```bash
curl -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "99999",
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
  }'
```

Expected: 404 Not Found

### Scenario 4: Unauthorized Request

```bash
curl -X GET "$BASE_URL/bookings" \
  -H "Content-Type: application/json"
```

Expected: 401 Unauthorized

---

## Batch Testing Script

Create a file `test-booking-api.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/api"
SESSION_TOKEN="your-session-token-here"

echo "🧪 Testing Booking API..."
echo ""

# Test 1: Get Flights
echo "1️⃣ Getting available flights..."
curl -s -X GET "$BASE_URL/flights" | jq '.data | length'
echo ""

# Test 2: Get Seats
echo "2️⃣ Getting seats for flight 1..."
curl -s -X GET "$BASE_URL/seats?flightId=1" | jq '.data | length'
echo ""

# Test 3: Create Booking
echo "3️⃣ Creating a booking..."
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "1",
    "passengers": [
      {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@example.com",
        "phone": "+1234567890"
      }
    ],
    "paymentInfo": {
      "cardNumber": "4111111111111111",
      "expiryDate": "12/25",
      "cvv": "123"
    }
  }')

echo "$BOOKING_RESPONSE" | jq '.'
PNR=$(echo "$BOOKING_RESPONSE" | jq -r '.data.pnr')
echo "Created booking with PNR: $PNR"
echo ""

# Test 4: Get Booking by PNR
echo "4️⃣ Getting booking by PNR..."
curl -s -X GET "$BASE_URL/bookings/$PNR" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" | jq '.'
echo ""

# Test 5: Get All Bookings
echo "5️⃣ Getting all bookings..."
curl -s -X GET "$BASE_URL/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" | jq '.data | length'
echo ""

echo "✅ All tests completed!"
```

Make it executable and run:

```bash
chmod +x test-booking-api.sh
./test-booking-api.sh
```

---

## Quick Reference

### Get Session Token from Browser

```bash
# Chrome/Edge DevTools Console
document.cookie.split('; ').find(row => row.startsWith('better-auth.session_token=')).split('=')[1]

# Firefox DevTools Console
document.cookie.split('; ').find(row => row.startsWith('better-auth.session_token=')).split('=')[1]
```

### Set Session Token

```bash
# Linux/Mac
export SESSION_TOKEN="your-token-here"

# Windows CMD
set SESSION_TOKEN=your-token-here

# Windows PowerShell
$env:SESSION_TOKEN="your-token-here"
```

### Check if Server is Running

```bash
curl -X GET "$BASE_URL/flights"
```

If you get a response, the server is running!

---

## Troubleshooting

### Issue: Connection Refused
```bash
# Check if server is running
curl http://localhost:3000

# Start the server
npm run dev
```

### Issue: 401 Unauthorized
```bash
# Get fresh session token from browser
# Then update the environment variable
export SESSION_TOKEN="new-token-here"
```

### Issue: Invalid JSON
```bash
# Validate your JSON
echo '{"flightId": "1"}' | jq '.'

# If jq is not installed
npm install -g json
echo '{"flightId": "1"}' | json
```

---

## Additional Resources

- **Postman Collection:** `docs/POSTMAN_API_TESTING.md`
- **API Documentation:** `docs/API_BOOKING_EXAMPLES.md`
- **Testing Guide:** `docs/TESTING_BOOKING_FLOW.md`
