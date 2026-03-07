# CivicPulse Appwrite Schema Setup

To ensure the backend works properly, you need to create the following Collections and Attributes in your Appwrite Console under Project: **CivicPulse**.

---

## 1. Database
Create a Database with ID: `69aae98000213ae92ae6` (as per your .env) or use the one configured in your dashboard.

---

## 2. Collection: `complaints`
**ID:** `complaints`

### Attributes:
| Attribute ID | Type | Size | Required | Notes |
|--------------|------|------|----------|-------|
| `title` | String | 255 | Yes | |
| `description`| String | 1000 | Yes | |
| `category` | String | 100 | Yes | |
| `subcategory`| String | 100 | No | |
| `status` | String | 50 | Yes | Default: `Submitted` |
| `priority` | String | 20 | Yes | Default: `Medium` |
| `address` | String | 500 | Yes | |
| `location` | String | 1000 | No | Stringified JSON `{lat, lng, address}` |
| `coordinates`| String | 500 | No | Stringified JSON `{lat, lng}` |
| `photos` | String | 2000 | No | Stringified Array of URLs/IDs |
| `timeline` | String | 5000 | No | Stringified Array of events |
| `userId` | String | 50 | Yes | |
| `ward` | String | 50 | No | |
| `createdAt` | DateTime | - | Yes | |
| `updatedAt` | DateTime | - | Yes | |

### Permissions:
- **Role: Users** -> Create
- **Role: Any** -> Read
- **Role: Admin (Label)** -> Update, Delete

---

## 3. Storage Bucket: `complaint_photos`
**ID:** `69aae9b100378201ba39`

### Settings:
- **Maximum File Size:** 10MB
- **Allowed Extensions:** jpg, jpeg, png, webp
- **Encryption:** Enabled
- **Antivirus:** Enabled

### Permissions:
- **Role: Users** -> Create, Read
- **Role: Admin (Label)** -> Update, Delete

---

## 4. Authentication Providers
1. Go to **Auth -> Settings**.
2. Enable **OAuth2 Providers -> Google**.
3. Add your Google Client ID and Secret.
4. Set the **Redirect URI** in Google Console to the one provided by Appwrite.
