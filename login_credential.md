# Demo Login Credentials

This file lists the current demo credentials configured in the project.

## Admin Access

- Portal: Official Admin Login
- Email: admin@civicpulse.com
- Password: admin123456

## Manager Access

Manager password format is based on first name:

- Password format: first_name_in_lowercase@123
- Example: Sanjay Sharma -> sanjay@123

| Manager ID | Name          | Email                 | Password   |
| ---------- | ------------- | --------------------- | ---------- |
| MGR-DEL-01 | Sanjay Sharma | sanjay@civicpulse.com | sanjay@123 |
| MGR-DEL-02 | Meena Kumari  | meena@civicpulse.com  | meena@123  |
| MGR-DEL-03 | Rajesh Tyagi  | rajesh@civicpulse.com | rajesh@123 |
| MGR-DEL-04 | Anita Singh   | anita@civicpulse.com  | anita@123  |
| MGR-DEL-05 | Amit Goel     | amit@civicpulse.com   | amit@123   |

## Worker Access

Note: All worker accounts currently use the same demo password.

- Password for all workers: Worker@123

| Worker ID  | Name   | Email                 | State | Area          |
| ---------- | ------ | --------------------- | ----- | ------------- |
| WKR-DEL-01 | Ramu   | ramu@civicpulse.com   | Delhi | North Delhi   |
| WKR-DEL-07 | Sunil  | sunil@civicpulse.com  | Delhi | Central Delhi |
| WKR-DEL-02 | Shamu  | shamu@civicpulse.com  | Delhi | North Delhi   |
| WKR-DEL-04 | Golu   | golu@civicpulse.com   | Delhi | North Delhi   |
| WKR-DEL-05 | Vikram | vikram@civicpulse.com | Delhi | Central Delhi |
| WKR-DEL-08 | Anil   | anil@civicpulse.com   | Delhi | Central Delhi |

## Notes For Future Production Rollout

- Replace hardcoded demo credentials with secure identity provider integration.
- Move role enforcement fully to backend-issued roles and claims.
- Rotate all credentials before any public deployment.
