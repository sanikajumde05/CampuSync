# RECLAIM — Campus Recovery System

> **Lost it. Found it. Reclaim it.**

RECLAIM is a smart campus Lost & Found platform designed for campuses where no dedicated Lost & Found team exists.

Instead of depending on notice boards, WhatsApp groups, or manual coordination, RECLAIM creates a centralized recovery workflow where students can report lost or found items, discover possible matches, verify ownership, and complete a secure handover.

---

## 🚀 Live Demo

**RECLAIM:**  
https://campus-lost-and-foun-rstf.bolt.host/

---

## 🎯 Problem

On a college campus, lost belongings are often difficult to recover because:

- There is no dedicated Lost & Found team.
- Lost and found information is scattered.
- A student may not know where to report an item.
- Similar items can lead to incorrect claims.
- There is no structured process for returning an item safely.

### Our Solution

RECLAIM turns the existing campus into a **digital recovery network**.

**Lost Item + Found Item → Smart Matching → Ownership Verification → Handover → Recovery**

---

## 💡 Key Features

### 🔐 Secure Sign In / Sign Up
Students create an account and access their personal recovery dashboard.

### 🔴 Report a Lost Item
Users can submit:
- Item details
- Description
- Location
- Approximate time
- Distinguishing features
- Item image

### 🟢 Report a Found Item
A finder can submit details about an item they discovered on campus.

### 🤖 AI-Assisted Matching
The system analyzes item information and identifies potential matches between lost and found reports.

A match is presented with a similarity percentage and supporting reasons.

Example:

**92% Possible Match**

- Similar item category
- Similar appearance/features
- Nearby location
- Compatible time

> The similarity score indicates a **possible match**, not guaranteed ownership.

### 🛡️ Ownership Challenge
This is the core differentiating feature of RECLAIM.

A possible match does not automatically mean the claimant is the owner.

The claimant must answer private questions about distinguishing characteristics of the item.

Example:

- What accessory was attached?
- Where was the scratch?
- What unique marking was present?

Correct answers lead to:

**✅ Ownership Verified**

Incorrect or inconsistent answers lead to:

**⚠ Additional Verification Required**

### 🎟️ Recovery Token
After successful verification, the system generates a recovery token associated with the verified claim.

Example:

`RCM-48271`

### 📍 Campus Handover
The verified owner can collect the item through an existing campus location such as:

- Library Reception
- Security Desk
- Department Office
- Hostel Office

This removes the need to create a separate Lost & Found team.

### 📊 Recovery Tracking
Each item follows a structured lifecycle:

**Reported → Matched → Verified → Handover → Recovered**

### 📈 Campus Recovery Insights
The dashboard can provide information such as:
- Lost items
- Found items
- Pending claims
- Successful recoveries
- Common locations for reported items

---

## 🔄 How RECLAIM Works

```text
┌───────────────────────┐
│ Student Loses Item    │
└───────────┬───────────┘
            │
            ↓
┌───────────────────────┐
│ Report Lost Item      │
└───────────┬───────────┘
            │
            │
            │       ┌───────────────────────┐
            └──────→│ Report Found Item     │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │ AI-Assisted Matching  │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │ Possible Match Found? │
                    └───────────┬───────────┘
                                │
                     Yes        │        No
                      ↓         │         ↓
          ┌────────────────┐    │   Wait for More
          │ Notify Owner   │    │     Reports
          └───────┬────────┘    │
                  ↓             │
          ┌────────────────────┐
          │ Ownership          │
          │ Challenge          │
          └────────┬───────────┘
                   │
             Verified?
              /       \
            Yes        No
             ↓          ↓
   ┌────────────────┐  ┌──────────────────┐
   │ Recovery Token │  │ Additional       │
   │ / QR           │  │ Verification     │
   └───────┬────────┘  └──────────────────┘
           ↓
   ┌────────────────────┐
   │ Campus Handover    │
   │ Point               │
   └──────────┬─────────┘
              ↓
      ┌─────────────────┐
      │ Item Recovered  │
      │       ✅        │
      └─────────────────┘
