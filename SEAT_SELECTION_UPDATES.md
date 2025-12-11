# Seat Selection Updates

## ✅ Task 1: Passenger Count Validation

### Changes Made:

1. **Import booking store** in `select-seat/page.tsx`:
   - Added `useBookingStore` to access passenger count from search params
   - Extract `passengerCount` from `bookingSearchParams?.passengers || 1`

2. **Seat selection limit**:
   - Users can only select seats equal to the number of passengers
   - Shows toast error when trying to select more seats than passengers
   - Error message: "You can only select X seat(s) for X passenger(s)"

3. **Confirmation validation**:
   - Users must select exactly the number of seats matching passenger count
   - Shows error if trying to confirm with fewer seats than required
   - Error message: "Please select X seat(s) for X passenger(s)"

4. **Visual feedback**:
   - Added passenger counter in header: "X / Y seats selected"
   - Shows Users icon with current selection status
   - SelectionSummary shows warning when seats are incomplete
   - Confirm button is disabled until exact number of seats selected

### User Flow:
1. User searches for flight with N passengers
2. Selects flight → Redirected to seat selection
3. Can select up to N seats (no more, no less)
4. Header shows "X / N seats selected"
5. Must select exactly N seats to proceed
6. Confirm button enabled only when N seats selected

---

## ✅ Task 2: Currency Change to VND

### Changes Made:

1. **SelectionSummary component**:
   - Added `formatVND()` helper function using `Intl.NumberFormat('vi-VN')`
   - Changed individual seat price display: `${price}` → `{formatVND(price)} ₫`
   - Changed total price display: `$X.XX` → `{formatVND(total)} ₫`

2. **Seat component tooltip**:
   - Updated hover tooltip to show VND format
   - Format: "12A - economy - 1,000,000 ₫"

3. **Admin panel**:
   - Changed price label: "Price ($)" → "Price (₫)"
   - Changed placeholder: "100" → "1000000"
   - Updated seat list display to show VND format

### Format Examples:
- `1000000` → `1.000.000 ₫`
- `2500000` → `2.500.000 ₫`
- Uses Vietnamese number formatting (dots as thousands separator)

---

## Files Modified:

1. `src/app/(protected)/select-seat/page.tsx`
   - Added passenger count validation
   - Added visual counter in header
   - Import booking store

2. `src/features/seats/components/selection-summary.tsx`
   - Added VND formatting
   - Added `requiredSeats` prop
   - Added completion validation
   - Shows warning for incomplete selection

3. `src/features/seats/components/seat.tsx`
   - Updated tooltip to show VND

4. `src/features/seats/components/admin-panel.tsx`
   - Updated price input label and placeholder
   - Updated seat list to show VND

---

## Testing:

### Test Passenger Count Validation:
1. Go to home page
2. Search for flight with 3 passengers
3. Select a flight
4. Try to select 4 seats → Should show error
5. Select only 2 seats → Confirm button disabled
6. Select exactly 3 seats → Confirm button enabled

### Test VND Display:
1. Select any seat
2. Check tooltip shows VND format
3. Check selection summary shows VND
4. Check total shows VND with proper formatting
5. Open admin panel → Check prices show VND

---

## Example Scenarios:

**Scenario 1: 1 Passenger**
- Must select exactly 1 seat
- Header shows: "0 / 1 seats selected" → "1 / 1 seats selected"
- Can proceed after selecting 1 seat

**Scenario 2: 4 Passengers**
- Must select exactly 4 seats
- Header shows: "0 / 4 seats selected" → "4 / 4 seats selected"
- Cannot select 5th seat (shows error)
- Cannot proceed with only 3 seats (button disabled)

**Scenario 3: Price Display**
- Business seat: 2.500.000 ₫
- Economy seat: 1.000.000 ₫
- Total for 2 economy: 2.000.000 ₫
- All prices use Vietnamese formatting

---

## Benefits:

✅ **Better UX**: Users know exactly how many seats to select
✅ **Prevents errors**: Can't book wrong number of seats
✅ **Clear feedback**: Visual counter and warnings
✅ **Localized**: Prices in Vietnamese Dong with proper formatting
✅ **Consistent**: All price displays use VND throughout the feature
