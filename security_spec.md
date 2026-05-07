# Security Specification - Fluent Academy

## 1. Data Invariants
- A **Student** cannot exist without a valid **Teacher** or **School** context (relational integrity).
- A **School** must have an **Admin Email** that matches a verified user with the `school_admin` role for management.
- **Alerts** are system-generated and once created, can only be marked as 'resolved' by authorized faculty/admin.
- **Payments** are immutable once recorded.
- **Waitlist** submissions are allowed for non-authenticated users, but viewing them is restricted to `admin`.

## 2. The "Dirty Dozen" Payloads (Attack Vectors)

1. **Email Spoofing (Admin Escalation)**: Attempting to create an `admins` document for a user UID without having the `drbiryanihelp@gmail.com` email.
2. **Ghost Field Injection (Schools)**: Adding `isVerified: true` to a school document when only `onboarding` status is allowed.
3. **Shadow Update (Users)**: A student attempting to change their `role` to `admin`.
4. **Identity Spoofing (Alerts)**: A student creating an alert for themselves to skip class.
5. **PII Blanket Leak (Users)**: An authenticated student attempting to list all `users` and view their `email` or `goal`.
6. **Orphaned Writes (Classes)**: Creating a class without an `ownerId` that matches the current user.
7. **Cross-School Data Scraping**: A `school_admin` of School A attempting to read `schools/SchoolB`.
8. **State Shortcutting (Onboarding)**: Setting `status: active` on a school while bypassing the `onboarding` workflow steps.
9. **Resource Poisoning (Long Strings)**: Sending a 1MB string for a student's `name`.
10. **Terminal State Locking Bypass**: Modifying a "resolved" alert once it's closed.
11. **Attendance Forgery**: A student marking themselves as "Present" in the `attendance` collection.
12. **Query Trust Violation**: Listing `weeklyReports` without a filter, expecting the rules to hide others' reports.

## 3. Red Team Evaluation Table

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning | Status |
|---|---|---|---|---|
| `users` | Blocked (UID check) | Blocked (Role immutable) | Protected (Size check) | ✅ Pass |
| `schools` | Blocked (Admin check) | **Weak** (No hasOnly) | Protected (Size check) | ⚠️ Warn |
| `classes` | Blocked (Owner check) | Blocked | Protected | ✅ Pass |
| `alerts` | Blocked (Teacher required) | Blocked (Status check) | Protected | ✅ Pass |
| `payments` | Blocked (Admin only) | Blocked | Protected | ✅ Pass |
| `waitlist` | Blocked | Blocked | Protected | ✅ Pass |

## 4. Remediation Plan
- Add `affectedKeys().hasOnly()` to `users` and `schools` update blocks.
- Strengthen `isValidSchool` to include `setupProgress` schema validation.
- Ensure `school_admin` can only access their specific school ID.
