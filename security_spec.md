# Security Specification: Fortress Firestore

## 1. Data Invariants
- Users can only read/write their own `UserProfile`.
- Parents can monitor students only if they have a linked record.
- Faculty can manage classes they own (verified by `ownerId`).
- Bookings must relate to a valid `userId` (the requester) and `facultyId` (the booked teacher).
- Terminal states (e.g. `status: 'completed'`) in `Bookings` must be immutable.

## 2. The "Dirty Dozen" Payloads (Examples to deny)
1.  Attempt to create a `UserProfile` with a different `userId` in the path.
2.  Attempt to update `monitoredStudents` for someone else's `userId`.
3.  Attempt to inject a 2MB string into `name` fields.
4.  Attempt to create a class where `ownerId` does not match `request.auth.uid`.
5.  Attempt to update a `Booking` status to 'completed' then back to 'pending'.
6.  Attempt to set an admin field on own `UserProfile`.
7.  Attempt list query on `studentPool` without authentication.
8.  Attempt write on `waitlist` with `requestedAt` set to a future timestamp.
9.  Attempt access to PII in `users` collection without proper authorization.
10. Attempt to link a student in `monitoredStudents` without existing `UserProfile`.
11. Attempt to inject shadow fields into `UserProfile`.
12. Attempt to list `classes` with an unauthenticated session.

## 3. Test Plan (`firestore.rules.test.ts` - abstract)
- Test `list` queries for all collections ensure they filter by `request.auth.uid`.
- Test `create` operations verify schema validation helpers.
- Test `update` operations verify field-level permissions (e.g., cannot change `createdAt`).
