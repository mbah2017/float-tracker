# Float Tracker: Professional User Manual

Welcome to the **Float Tracker** platform. This comprehensive guide is designed to help Master Agents and Operators navigate the system efficiently, manage liquidity with precision, and maintain a high-performing agent network.

---

# Master Agent Guide

## 1. 🚀 Onboarding and Initial Setup
The Master Agent is the business owner. Upon your first login, your account is granted full administrative privileges.

*   **Business Profile:** Your "Business Name" is the primary identity for your operation. It will appear on all sub-agent confirmations and reports.
*   **Security:** Your session is protected by signed tokens. If you manually edit your role in the browser, the system will invalidate your session for your protection.
*   **System Reset:** In the top navigation bar (or mobile sidebar), you have access to the `Reset System` button. This is a "nuclear option" that clears all data. It requires two confirmations and should only be used if you wish to wipe the database entirely.

> **Tip:** Keep your Master Agent credentials secure. Use the **Operators** tab to create separate accounts for your staff.

## 2. 👥 Managing Sub-Agents
Your agent network is managed via the **"Manage Agents"** tab.

#### Onboarding
*   **Individual Onboarding:** Use `Add Agent` to register agents with their Name, Location, and Phone.
*   **Bulk Import:** Use the `Template` button to get the CSV format, fill it out, and use `Import` to onboard dozens of agents instantly.
*   **Mobile Support:** The import and export features are fully optimized for mobile and tablet devices.

#### Monitoring
*   **Balance Monitoring:** View real-time "Total Due" for every agent. 
    *   🔴 **Red Balance:** Indicates outstanding debt.
    *   🟢 **Green Balance:** Indicates a cleared account.

## 3. 🛠️ Team Management & Granular Permissions
Delegate daily tasks to your staff using the **"Operators"** tab. The system uses a granular permission model.

#### Managing Staff Accounts
*   **Creating Operators:** Assign a unique username and a password (min. 6 characters).
*   **Editing & Updating:** Use the **Edit (pencil)** icon next to any staff member to modify their permissions or update their password after creation.
*   **Delegated Management:** If you grant an operator the `MANAGE_OPERATORS` permission, they can add and manage other staff members for you. 
    *   *Managers* can assign all permissions **except** for `RESET_SYSTEM`.
    *   Staff cannot edit or delete the Master Agent account or their own account.

### Key Permissions Explained

| Permission | Description |
| :--- | :--- |
| **ISSUE_FLOAT** | Ability to process outbound loans to agents. |
| **RETURN_FLOAT** | Ability to process inbound repayments from agents. |
| **VIEW_LIQUIDITY** | Allows viewing the daily snapshot without editing rights. |
| **MANAGE_LIQUIDITY** | Grants power to adjust balances and perform the Day-End closing. |
| **DELETE_TRANSACTION** | Required to remove records from history (Master only by default). |
| **MANAGE_MANUAL** | Allows editing this manual's content and visual theme. |
| **RESET_SYSTEM** | High-level access to wipe all local data from the device. |
| **VIEW_DASHBOARD** | Access to the main statistics dashboard view. |
| **VIEW_TEAM_DEBT** | Visibility of the total outstanding debt across all agents. |

## 4. 🎨 Customizing the Experience
Master Agents can customize the look and feel of the documentation via the `Customize Manual` button.

*   **Content Editor:** Rewrite any part of this manual using standard Markdown.
*   **Typography:** Switch between Modern Sans, Classic Serif, or Technical Mono fonts.
*   **Theme Colors:** Adjust the interface highlights to match your brand (Blue, Indigo, Purple, Emerald, or Slate).

## 5. 💰 Liquidity Management & Reconciliation
This is the heart of the system, found under the **"Liquidity"** tab.

#### Understanding Core Metrics
*   **Total Actual Balance:** The exact sum of cash and digital money currently in your possession (Cash + Bank + Wallets).
*   **Total Operating Liquidity:** Your true working capital. This is your **Total Actual Balance** PLUS all **outstanding loans** currently held by your agents.

#### The Reconciliation Workflow
1.  **Verify Actuals:** Look at the "Channel Reconciliation" table. The "Actual" column is pre-filled with the **Expected** balance for convenience.
2.  **Adjust Discrepancies:** If your physical cash or wallet balance differs, type the *real* amount into the "Actual" box.
3.  **Bookkeeping Adjustments:** Use the `Adj` button to automatically create a system log that aligns your records with physical reality.
4.  **Finalize Closing:** If an "Overall Discrepancy" remains, provide an explanation and click `Finalize & Close Day`. This carries over your *Actual* balances as tomorrow's *Opening* balances.

---

# Operator Guide

## 1. 👋 Getting Started
Log in with credentials provided by your manager. Your sidebar will only show the tabs you have been granted permission to use.

## 2. 📑 Daily Operations: Issuing and Returning Float

#### Issuing Float (Outbound)
1.  Click `Issue Float` in the Quick Actions menu.
2.  Select the **Agent** and verify their current debt.
3.  Choose the **Source of Funds** (e.g., Wave, Cash, Bank).
4.  Enter **Amount** and confirm the **Legal Agreement**.
5.  Upon clicking "Confirm," a WhatsApp receipt is sent to the agent automatically.

#### Processing Returns (Inbound)
1.  Go to **"Manage Agents"** -> `Return`.
2.  Choose the type:
    *   **Pay Back Loan:** For partial repayments.
    *   **Return Float:** For full end-of-day checkout.
3.  Enter amount and confirm. The system will alert you if the agent's debt is cleared.

## 3. 🏁 End-of-Day Procedures
Before your shift ends:
*   Ensure every physical transaction is recorded.
*   Review the **"Reports"** tab for accuracy.
*   If you have the **VIEW_LIQUIDITY** permission, verify that "Expected" totals match your physical counts before handing over to the next shift or the Master Agent.
