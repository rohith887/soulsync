# Dating App API Documentation

This repository contains the API documentation for the Dating App backend, covering Admin and User functionalities including authentication, profile management, settings, matching, chat, and premium features.

---

## Base URLs

- **Admin API:** `http://97.74.93.26:6100`
- **User API:** `http://97.74.93.26:3000`

---

## Features

### Admin API

- Admin user registration, login, and profile update
- User management (suspend, verify, ban, search, export)
- Analytics overview
- App configuration and theming
- Financial operations like revenue tracking and refunds
- Moderation and report handling
- Premium subscription and plans management
- Profile creation and batch uploads
- Security controls for blocking/unblocking users

### User API

- Authentication via Email/Mobile + Password, OTP, Facebook, Google
- Full user profile creation, update, and deletion
- Account and app settings management (password change, preferences, notifications)
- Safety features (user reporting and blocking)
- Premium subscription and profile boosts
- Matchmaking (swipes, super swipes, messages)
- Real-time chat with media upload support

---

## Authentication Endpoints

- POST `/user/login` — Login via email/mobile + password
- POST `/user/login/otp/request` — Request OTP for mobile login
- POST `/user/login/otp/verify` — Verify OTP
- Facebook and Google OAuth login endpoints

---

## Profile Endpoints

- POST `/profile/:userId/create` — Create profile
- PUT `/profile/:userId/update` — Update profile
- DELETE `/profile/:userId/delete` — Delete profile

---

## Settings Endpoints

- Change password, update profile info, delete account
- Manage notification preferences and sessions
- Block/unblock users and submit feedback

---

## Other Endpoints

- Safety: Report and block users
- Premium: Subscribe and boost profile
- Preferences: Create, get, update, delete
- Notifications: Get and mark as read
- Match: Swipe, suggestions, super swipe, messaging
- Chat: Send messages, history, upload media

---

## Usage

To use this API, send HTTP requests to the respective endpoints with JSON payloads as documented. Authentication tokens or session management may be required where applicable.

---

## Contribution

Feel free to open issues or submit pull requests for improvements or new features.

---

## License

[MIT License](LICENSE)

---

## Contact

For support or queries, please reach out to the project maintainer.

---

**Note:** This documentation corresponds to API hosted at IP `97.74.93.26` and may be subject to change.

