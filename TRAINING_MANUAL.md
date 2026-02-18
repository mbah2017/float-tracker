# Float Tracker: Professional User Manual

Welcome to the **Float Tracker** platform. This comprehensive guide is designed to help Master Agents and Operators navigate the system efficiently, manage liquidity with precision, and maintain a high-performing agent network.

---

## Table of Contents
1. [For Master Agents](#master-agent-guide)
   - [Onboarding & Setup](#1-onboarding-and-initial-setup)
   - [Agent Network Management](#2-managing-sub-agents)
   - [Team Management](#3-operator-management)
   - [Liquidity & Reconciliation](#4-liquidity-management--channel-reconciliation)
   - [Performance Reporting](#5-reporting-and-reconciliation)
2. [For Operators](#operator-guide)
   - [Daily Workflow](#2-daily-operations-issuing-and-returning-float)
   - [Agent Verification](#3-viewing-agent-information)
   - [Shift Closing](#4-end-of-day-procedures)

---

## Master Agent Guide

### 1. Onboarding and Initial Setup
The Master Agent is the business owner. Upon your first login, your account is granted administrative privileges.
*   **Business Profile:** Your "Business Name" is the primary identity for your operation. It will appear on all sub-agent confirmations and reports.
*   **Administrative Control:** You have exclusive access to the "Operators" and "Liquidity" settings.

### 2. Managing Sub-Agents
Your agent network is managed via the **"Manage Agents"** tab.
*   **Individual Onboarding:** Use "Add Agent" to register agents with their Name, Location, and Phone.
*   **Bulk Import:** Use the "Template" button to get the CSV format, fill it out, and use "Import" to onboard dozens of agents instantly.
*   **Balance Monitoring:** View real-time "Total Due" for every agent. A red balance indicates outstanding debt, while green indicates a cleared account.

### 3. Operator Management
Delegate daily tasks to your staff using the **"Operators"** tab.
*   **Role-Based Access:** Create dedicated accounts for your staff. Operators can process transactions but cannot delete operators or override certain liquidity locks.
*   **Security:** Assign unique usernames and strong passwords. You can revoke access at any time by deleting an operator account.

### 4. Liquidity Management & Channel Reconciliation
This is the heart of the system, found under the **"Liquidity"** tab.

#### Understanding Core Metrics
*   **Total Actual Balance:** The exact sum of cash and digital money currently in your possession (Cash + Bank + Wallets).
*   **Total Operating Liquidity:** Your true working capital. This is your **Total Actual Balance** PLUS all **outstanding loans** currently held by your agents.

#### The Reconciliation Workflow
At the end of every business day, you must reconcile your books:
1.  **Verify Actuals:** Look at the "Channel Reconciliation" table. The "Actual" column is pre-filled with the **Expected** balance based on today's transactions.
2.  **Adjust Discrepancies:** If your physical cash or wallet balance differs from the screen, type the *real* amount into the "Actual" box.
3.  **Bookkeeping Adjustments:** If a discrepancy exists, use the **"Adj"** (Adjustment) button. This creates a system log to align your digital records with your physical reality.
4.  **Finalize Closing:** If an "Overall Discrepancy" remains, you must provide a brief explanation. Click **"Finalize & Close Day"** to carry over these actual balances as tomorrow's starting point.

### 5. Reporting and Reconciliation
The **"Reports"** tab provides full transparency into your history.
*   **Date Selection:** View any past day's performance by selecting a date.
*   **Audit Trail:** Every transaction shows the timestamp and the specific Operator who performed the action.
*   **WhatsApp Reports:** Select an agent and click "WhatsApp" to send them a professional summary of their day's transactions and final balance.

---

## Operator Guide

### 1. Getting Started
Log in with the credentials provided by your Master Agent. Your dashboard is optimized for speed and accuracy in high-volume environments.

### 2. Daily Operations: Issuing and Returning Float
#### Issuing Float (Outbound)
1.  Click **"Issue Float"** in the Quick Actions menu.
2.  Select the Agent and verify their current debt.
3.  Choose the **Source of Funds** (e.g., Wave, Cash, Bank).
4.  Enter the Amount and confirm the **Legal Agreement** checkmark.
5.  Upon clicking "Confirm," a WhatsApp receipt is sent to the agent automatically.

#### Processing Returns (Inbound)
1.  Go to **"Manage Agents"** and find the agent returning funds.
2.  Select **"Return"**.
3.  Choose the type: **"Pay Back Loan"** (partial) or **"Return Float"** (full checkout).
4.  Enter the amount and confirm receipt. The system will notify you if the agent's debt is now fully cleared.

### 3. Viewing Agent Information
Use the **"Manage Agents"** tab to verify an agent's creditworthiness before issuing more float. You can see their "Prev. Debt" from yesterday and "Issued Today" to ensure they aren't exceeding their limits.

### 4. End-of-Day Procedures
Before your shift ends:
*   Ensure every physical transaction is recorded in the system.
*   Review the **"Reports"** tab to check for any missing entries.
*   Collaborate with your Master Agent to verify that your channel balances match the "Expected" totals.
