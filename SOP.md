# AICRONE Fleet Management System - Standard Operating Procedure (SOP)

## 1. Introduction
This document serves as the Standard Operating Procedure for the AICRONE Fleet Management System. It guides users through the core functionalities, including real-time tracking, alert management, and system navigation.

---

## 2. Getting Started

### 2.1 Login
Access the system via the secure login page.
1.  Enter your **Username** and **Password**.
2.  Click **"Sign In"**.
3.  *Note:* The background features a live map visualization of the operational area.

![Login Page Screenshot](./screenshots/login_page.png)
*(Place screenshot of Login Page here)*

---

## 3. Dashboard Overview
Upon successful login, you are directed to the main Dashboard. The interface consists of three main areas:
1.  **Sidebar (Left):** Navigation menu for different modules.
2.  **Live Map (Center):** Real-time visualization of the fleet.
3.  **Stats Panel (Top Right):** Quick summary of fleet status.

![Dashboard Overview Screenshot](./screenshots/dashboard_overview.png)
*(Place screenshot of Main Dashboard here)*

---

## 4. Live Tracking Features

### 4.1 Fleet Visualization
*   **Vehicles** are represented by 3D truck icons on the map.
*   **Status Indicators:**
    *   **Blue/Moving:** Vehicle is currently in transit.
    *   **Yellow/Idle:** Vehicle is stationary but active.
    *   **Grey/Stopped:** Vehicle is turned off.

### 4.2 Vehicle Details
Click on any vehicle icon to open the **Detail Panel**.
*   **Information Displayed:**
    *   Driver Name & Photo
    *   Current Speed & Fuel Level
    *   Location Coordinates
    *   Vehicle Plate Number

![Vehicle Detail Panel Screenshot](./screenshots/vehicle_detail.png)
*(Place screenshot of Vehicle Detail Panel here)*

---

## 5. Alert Management System

### 5.1 Receiving Alerts
The system monitors fleet metrics in real-time and generates alerts for:
*   **Critical Events (Red):** e.g., Speeding, Accident, Geofence Breach.
*   **Warnings (Orange):** e.g., Low Fuel, Maintenance Due.
*   **Info (Blue):** e.g., Trip Started, Trip Ended.

Alerts appear as **Glassmorphism Notifications** in the bottom-right corner.

### 5.2 Managing Alerts
1.  **View Driver:** The alert card displays the name of the driver responsible.
2.  **Dismiss:** Click the **"X"** button (visible on hover) to remove a single alert.
3.  **Clear All:** Click the **"Clear All"** button to remove all visible notifications.

![Alert Notification Screenshot](./screenshots/alert_notification.png)
*(Place screenshot of Alert Notification here)*

---

## 6. System Navigation (Sidebar)

Use the sidebar to navigate between modules:
*   **Live Tracking:** Return to the main map view.
*   **Fuel & Analytics:** View fuel consumption reports.
*   **Route Replay:** Playback historical vehicle routes.
*   **Drivers:** Manage driver profiles and shifts.
*   **Vehicles:** Manage vehicle inventory and specs.
*   **Maintenance:** Schedule and track repairs.

![Sidebar Navigation Screenshot](./screenshots/sidebar_menu.png)
*(Place screenshot of Sidebar Menu here)*

---

## 7. Settings & Customization

### 7.1 Theme Toggle
Switch between **Light Mode** and **Dark Mode** using the toggle button in the sidebar footer. The dashboard adapts immediately with a glass-like aesthetic.

### 7.2 Profile
View the currently logged-in user details at the bottom of the sidebar. Click **"Sign Out"** to exit the system.

---

## 8. Troubleshooting

*   **Map Not Loading:** Ensure you have an active internet connection. The system will show a "Initializing Map System" screen with a grid pattern while connecting.
*   **No GPS Data:** Check if the vehicle tracking devices are online.
