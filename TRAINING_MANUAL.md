# Float Tracker: Professional User Manual

Welcome to the **Float Tracker** platform. This comprehensive guide is designed to help Master Agents and Operators navigate the system efficiently, manage liquidity with precision, and maintain a high-performing agent network.

---

## Table of Contents
1. [For Master Agents & Managers](#master-agent-guide)
   - [Onboarding & Setup](#1-onboarding-and-initial-setup)
   - [Agent Network Management](#2-managing-sub-agents)
   - [Team Management & Permissions](#3-team-management--granular-permissions)
   - [Liquidity & Reconciliation](#4-liquidity-management--channel-reconciliation)
   - [Performance Reporting](#5-reporting-and-reconciliation)
2. [For Operators](#operator-guide)
   - [Daily Workflow](#2-daily-operations-issuing-and-returning-float)
   - [Agent Verification](#3-viewing-agent-information)
   - [Shift Closing](#4-end-of-day-procedures)

---

## Master Agent Guide

### 1. Onboarding and Initial Setup
The Master Agent is the business owner. Upon your first login, your account is granted full administrative privileges.
*   **Business Profile:** Your "Business Name" is the primary identity for your operation. It will appear on all sub-agent confirmations and reports.
*   **Security:** Your session is protected by signed tokens. If you manually edit your role in the browser, the system will invalidate your session for your protection.

### 2. Managing Sub-Agents
Your agent network is managed via the **"Manage Agents"** tab.
*   **Individual Onboarding:** Use "Add Agent" to register agents with their Name, Location, and Phone.
*   **Bulk Import:** Use the "Template" button to get the CSV format, fill it out, and use "Import" to onboard dozens of agents instantly.
*   **Balance Monitoring:** View real-time "Total Due" for every agent. A red balance indicates outstanding debt, while green indicates a cleared account.

### 3. Team Management & Granular Permissions
Delegate daily tasks to your staff using the **"Operators"** tab. The system uses a granular permission model to ensure staff only access what they need.

#### Managing Staff Accounts
*   **Creating Operators:** Assign a unique username and a password (min. 6 characters).
*   **Editing & Updating:** Use the **Edit (pencil)** icon next to any staff member to modify their permissions or update their password after creation.
*   **Delegated Management:** If you grant an operator the `MANAGE_OPERATORS` permission, they can add and manage other staff members for you. (Note: Staff cannot edit or delete the Master Agent account).

#### Key Permissions Explained
*   **ISSUE_FLOAT / RETURN_FLOAT:** Core abilities to process loans and repayments.
*   **VIEW_LIQUIDITY:** Allows viewing the daily snapshot without editing rights.
*   **MANAGE_LIQUIDITY:** Grants power to adjust balances and perform the Day-End closing.
*   **DELETE_TRANSACTION:** A high-level permission (Master only by default) required to remove records from the history.
*   **VIEW_REPORTS:** Access to the daily audit trail and WhatsApp report generation.

### 4. Liquidity Management & Channel Reconciliation
This is the heart of the system, found under the **"Liquidity"** tab.

#### Understanding Core Metrics
*   **Total Actual Balance:** The exact sum of cash and digital money currently in your possession (Cash + Bank + Wallets).
*   **Total Operating Liquidity:** Your true working capital. This is your **Total Actual Balance** PLUS all **outstanding loans** currently held by your agents.

#### The Reconciliation Workflow
1.  **Verify Actuals:** Look at the "Channel Reconciliation" table. The "Actual" column is pre-filled with the **Expected** balance for convenience.
2.  **Adjust Discrepancies:** If your physical cash or wallet balance differs, type the *real* amount into the "Actual" box.
3.  **Bookkeeping Adjustments:** Use the **"Adj"** button to automatically create a system log that aligns your records with physical reality.
4.  **Finalize Closing:** If an "Overall Discrepancy" remains, provide an explanation and click **"Finalize & Close Day"**. This carries over your *Actual* balances as tomorrow's *Opening* balances.

### 5. Reporting and Reconciliation
The **"Reports"** tab provides full transparency into your history.
*   **Audit Trail:** Every transaction shows the timestamp and the specific Operator who performed it.
*   **Restricted Deletion:** Transactions can only be deleted by users with the `DELETE_TRANSACTION` permission.
*   **WhatsApp Reports:** Select an agent and click "WhatsApp" to send them a professional summary of their day's transactions and final balance.

---

## Operator Guide

### 1. Getting Started
Log in with credentials provided by your manager. Your sidebar will only show the tabs you have been granted permission to use.

### 2. Daily Operations: Issuing and Returning Float
#### Issuing Float (Outbound)
1.  Click **"Issue Float"** in the Quick Actions menu.
2.  Select the Agent and verify their current debt.
3.  Choose the **Source of Funds** (e.g., Wave, Cash, Bank).
4.  Enter Amount and confirm the **Legal Agreement**.
5.  Upon clicking "Confirm," a WhatsApp receipt is sent to the agent automatically.

#### Processing Returns (Inbound)
1.  Go to **"Manage Agents"** -> **"Return"**.
2.  Choose: **"Pay Back Loan"** (partial) or **"Return Float"** (full checkout).
3.  Enter amount and confirm. The system will alert you if the agent's debt is cleared.

### 3. Viewing Agent Information
Use the **"Manage Agents"** tab to verify an agent's creditworthiness. You can see their "Prev. Debt" from yesterday and "Issued Today" to ensure they stay within limits.

### 4. End-of-Day Procedures
Before your shift ends:
*   Ensure every physical transaction is recorded.
*   Review the **"Reports"** tab for accuracy.
*   If you have the **VIEW_LIQUIDITY** permission, verify that "Expected" totals match your physical counts before handing over to the next shift or the Master Agent.
