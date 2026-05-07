# FLUENT Platform QA Verification Ledger

## 1. Core Flow (End-to-End)
| Test Case | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Lead Generation** | Submit form on Landing Page | Data in `waitlist`, WhatsApp log in `notifications` | [ ] |
| **Onboarding Gate** | Complete onboarding up to Payment | Payment modal triggers via Razorpay | [ ] |
| **Payment Success** | Complete Razorpay (Test Mode) | Profile `isPaid: true` and Dashboard unlocks | [ ] |
| **Full Lifecycle** | Lead -> Payment -> Assignment | User journey complete without session breaks | [ ] |

## 2. Intelligence & Alerts
| Test Case | Trigger | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Scholar Risk** | Teacher submits <60% Marks | Alert appears in Student, Parent, and Admin views | [ ] |
| **Attendance Lock** | Mark scholar 'Absent' 3+ times | 'Attendance Critical' alert generated in Admin Command | [ ] |
| **Faculty Issue** | Submit low scores across 5+ reports | 'Faculty Performance Issue' alert generated | [ ] |

## 3. Role Dashboards
| Dashboard | Module | Verification Goal | Status |
| :--- | :--- | :--- | :--- |
| **Admin** | Leads Pipeline | Approve/Reject functionality works | [ ] |
| **Teacher** | Analytics | Growth Insights text renders based on history | [ ] |
| **Parent** | Reports | Weekly mastery trajectory chart renders | [ ] |
| **Student** | Confidence | Interactive cards update progress | [ ] |

## 4. Security & Edge Cases
| Scenario | Requirement | Status |
| :--- | :--- | :--- |
| **Unauth Access** | Student trying to access `/admin` paths | Blocked by Firestore Rules | [ ] |
| **Empty Data** | New teacher with 0 reports | Analytics shows "establishing baseline" | [ ] |
| **Payment Fail** | User cancels Razorpay | UI remains on payment step, database un-updated | [ ] |
