# 🛡️ Project Report: Network Access Control (NAC) System Demo
================================================================

## 📌 Project Title  
**Network Access Control (NAC) System – Web-based Simulation**

## 🧠 Objective  
Design and develop an interactive web-based simulation of a Network Access Control (NAC) system that demonstrates how an organization can enforce access controls based on multiple parameters—user roles, device compliance, email verification, and dynamic security policies.

## 💡 Motivation  
In modern IT infrastructures, ensuring that only authorized users and secure devices can access critical resources is vital. NAC systems provide the necessary framework by enforcing policies that evaluate both the user identity (including aspects like email verification) and the device posture. This demo serves as an educational tool that visualizes how layered access control mechanisms work in practice with real-time insights and logs.

## 🔧 Tools & Technologies  

**Category:**  
- **Frontend:** React 18.3.1 with TypeScript  
- **Build Tool:** Vite 5.4.2  
- **Styling:** Tailwind CSS 3.4.1, PostCSS, Autoprefixer  
- **Icons:** Lucide React  
- **Linting & Quality:** ESLint, TypeScript strict mode  
- **Version Control:** Git & GitHub  

## 🧩 System Architecture  

### Data Layer:
- **Users:** Role-based classification (Admin, User, Guest) with additional fields such as department, email, and email verification status.
- **Devices:** Identified by type (Desktop, Laptop, Mobile, Tablet), OS, and compliance status.
- **Policies:** Define access conditions including permitted roles, device types, required departments, compliance status, and time-based access windows.
- **Logs:** Record each access attempt with detailed data—timestamps, user/device IDs, outcomes, and specific reasons for denial.

### Application Logic:
- **Dynamic Access Decisions:** Matches user and device attributes against defined policies.
- **Advanced Email Verification:** Regular users must have a verified email (with a manual verification option for a specific email) before access is allowed on desktops/laptops.
- **Multi-Factor Emergency Override:** Admins can bypass policies during emergencies using a simulated password check along with a two-factor authentication (2FA) process for mobile devices.
- **Logging & Analytics:** Detailed logs record all access attempts; additional modules provide filtering, CSV export, and an analytics dashboard for quick performance insights.

## ✅ Features Implemented  

| **Feature**                                 | **Description**                                                                                                                                                                         |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Role-Based Access Control**               | Access permissions determined by user roles and department affiliations.                                                                                                              |
| **Device Compliance Management**            | Devices classified by type and evaluated for compliance before granting access.                                                                                                       |
| **Dynamic Security Policies**               | Policies include compliance requirements, allowed departments, and time-based access windows (e.g., working hours between 09:00 and 17:00).                                             |
| **Email Verification for Regular Users**    | Regular users must verify their email. A dedicated panel allows sending a verification code and also provides manual verification using a specified email (“harsh@nitp.ac.in”).   |
| **Multi-Factor Emergency Override**         | Admins can trigger an emergency override. For mobile devices, this involves checking an override password and completing a 2FA process with a dynamic 6-digit code.                    |
| **Emergency Override Lockout**              | After multiple failed emergency override attempts, the system automatically locks the override for a period to prevent abuse.                                                          |
| **Interactive Logs & Visual Feedback**      | Detailed real-time logs track each access attempt with color-coded visual cues for granted/denied actions.                                                                               |
| **Log Filtering & CSV Export**              | Enables filtering of logs by status (All, Granted, Denied) and exporting logs in CSV format for further analysis or record-keeping.                                                    |
| **Analytics Dashboard**                     | Displays summary statistics including total attempts, counts for granted/denied accesses, and overall success rate to provide quick audit insights.                                   |

## 🧪 Testing Scenarios  

| **Scenario**                                          | **Expected Outcome**                                                                                                              |
|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Admin using a compliant laptop                        | Access granted via normal admin policies or through emergency override if activated.                                               |
| Admin on mobile with emergency override (correct 2FA) | Access granted after correct override password and valid 2FA code; emergency override lockout logic activated on multiple failures.   |
| Guest using non-compliant mobile device               | Access denied with a clear explanation (e.g., policy non-compliance).                                                               |
| Regular user with desktop/laptop (unverified email)   | Access denied until the email is verified either through code-based or manual verification (matches “harsh@nitp.ac.in”).                |
| Regular user with email verified                     | Access granted based on the General Access Policy (subject to time-based constraints).                                              |
| Changing departments or device type                   | Access rights update dynamically based on new user or device attributes, as reflected in policy evaluations.                         |

## 📁 Project Structure  

```
nac-system-demo/
├── src/
│   ├── App.tsx                 # Main application logic including email, emergency override & analytics functionality
│   ├── data.ts                 # Static mock data for users, devices, and policies
│   ├── types.ts                # TypeScript interface definitions for Users, Devices, Logs, and Policies
│   └── components/
│       ├── UserPanel.tsx       # UI panel for user selection and email verification controls
│       ├── DevicePanel.tsx     # UI panel to display device details and compliance status
│       └── AccessLogPanel.tsx  # UI panel to view, filter, and export access logs
├── tailwind.config.js
├── vite.config.ts
├── package.json
└── README.md
```

## 📈 Outcomes  
- **Demonstrated Sophisticated NAC Logic:**  
  The system clearly demonstrates real-world enforcement scenarios including layered authentication, device compliance, time-based checks, and fallback mechanisms via emergency override.
- **Reusable Framework:**  
  Created a modular simulation framework applicable for both academic learning and enterprise demonstrations.
- **Modern Development Practices:**  
  Developed using state-of-the-art frontend technologies with TypeScript, ensuring strict type safety and clean architectural patterns.

## 🔮 Future Scope  
- **Authentication Integration:**  
  Integrate with real-world authentication systems (e.g., SSO, LDAP).
- **Database and API Integration:**  
  Replace mock data with live data from a database such as Firebase or MongoDB.
- **Policy Editor Interface:**  
  Allow administrators to dynamically create and update security policies through a dedicated UI.
- **Enhanced Mobile Compatibility:**  
  Further optimize the mobile UI/UX for touch-based interaction and responsive layouts.
- **Real-time Email Integration:**  
  Incorporate actual email services for sending verification codes and notifications.
