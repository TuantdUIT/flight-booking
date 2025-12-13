# Booking DOB Field Update

## Overview

Added date of birth (DOB) field to the booking validation schema and booking data submission flow.

## Changes Made

### 1. Validation Schema (`src/features/bookings/validations/create-booking.ts`)

**Added `dob` field to passenger object:**

```typescript
passengers: z.array(
  z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    dob: z.string().optional(), // ✅ Added: Date of birth (YYYY-MM-DD format)
  }),
),
```

**Field Details:**
- **Type:** `string` (ISO date format: YYYY-MM-DD)
- **Required:** No (optional)
- **Format:** "1990-01-15"
- **Validation:** None (optional field)

### 2. Bookings Service (`src/features/bookings/services/bookings.service.ts`)

**Updated passenger data creation:**

```typescript
for (const passenger of passengers) {
  const passengerData = {
    name: `${passenger.firstName} ${passenger.lastName}`,
    email: passenger.email,
    phoneNumber: passenger.phone,
    dob: passenger.dob || null, // ✅ Added: Include DOB if provided
  };

  const newPassenger = await passengersRepository.createPassenger(passengerData);
  createdPassengers.push(newPassenger);
}
```

### 3. Summary Page (`src/app/(protected)/summary/page.tsx`)

**Updated booking data preparation:**

```typescript
const bookingData = {
  flightId: selectedFlight.id,
  passengers: passengers.map((p) => ({
    firstName: p.fullName.split(" ")[0] || p.fullName,
    lastName: p.fullName.split(" ").slice(1).join(" ") || p.fullName,
    email: p.email,
    phone: p.phoneNumber,
    dob: p.dateOfBirth, // ✅ Added: Include date of birth
  })),
  paymentInfo: {
    cardNumber: "4111111111111111",
    expiryDate: "12/25",
    cvv: "123",
  },
};
```

## API Request Example

### With DOB

```json
{
  "flightId": "1",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "dob": "1990-01-15"
    }
  ],
  "paymentInfo": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

### Without DOB (Still Valid)

```json
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

## Database Schema

The `passenger` table already has a `dob` field:

```sql
CREATE TABLE passenger (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE,              -- ✅ Already exists (nullable)
  nationality TEXT,
  passport TEXT,
  email TEXT,
  phonenumber TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Data Flow

```
Frontend (Passenger Form)
    ↓
  dateOfBirth: "1990-01-15"
    ↓
Summary Page
    ↓
  dob: p.dateOfBirth
    ↓
API Request
    ↓
  passengers[0].dob: "1990-01-15"
    ↓
Validation (Zod)
    ↓
  ✅ Optional field, passes validation
    ↓
Bookings Service
    ↓
  passengerData.dob: passenger.dob || null
    ↓
Passengers Repository
    ↓
  INSERT INTO passenger (name, email, phonenumber, dob)
    ↓
Database
```

## Testing

### Test with DOB

```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Cookie: better-auth.session_token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "1",
    "passengers": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "dob": "1990-01-15"
      }
    ],
    "paymentInfo": {
      "cardNumber": "4111111111111111",
      "expiryDate": "12/25",
      "cvv": "123"
    }
  }'
```

### Verify in Database

```sql
-- Check passenger was created with DOB
SELECT id, name, dob, email, phonenumber 
FROM passenger 
ORDER BY id DESC 
LIMIT 1;

-- Expected result:
-- id | name     | dob        | email                | phonenumber
-- 1  | John Doe | 1990-01-15 | john.doe@example.com | +1234567890
```

## Benefits

1. **Optional Field** - Doesn't break existing bookings without DOB
2. **Type Safe** - Validated by Zod schema
3. **Database Ready** - Schema already supports DOB field
4. **Backward Compatible** - Works with or without DOB
5. **Future Ready** - Can make it required later if needed

## Making DOB Required (Future)

If you want to make DOB required in the future:

```typescript
// In validation schema
dob: z.string().min(1, { message: "Date of birth is required" }),

// Or with date validation
dob: z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" })
  .refine((date) => {
    const dob = new Date(date);
    const today = new Date();
    return dob < today;
  }, { message: "Date of birth must be in the past" }),
```

## Summary

✅ Added `dob` field to validation schema (optional)
✅ Updated bookings service to include DOB when creating passengers
✅ Updated summary page to pass DOB in booking data
✅ Backward compatible - works with or without DOB
✅ All changes compile without errors

The booking system now supports date of birth for passengers!
