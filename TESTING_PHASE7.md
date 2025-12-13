# Phase 7 Testing Guide - Appointments & Centers Module

This guide contains all GraphQL queries and mutations to test the Appointments & Centers module.

## Prerequisites

1. Start your server: `npm run dev`
2. Open Apollo Sandbox: `http://localhost:4000/graphql`
3. Authenticate first (get a JWT token) - see Authentication section below

## Authentication

First, you need to authenticate to get a JWT token:

### 1. Send OTP
```graphql
mutation SendOTP {
  sendOTP(mobile: "9876543210")
}
```

### 2. Verify OTP and Get Token
```graphql
mutation VerifyOTP {
  verifyOTP(
    mobile: "9876543210"
    otp: "123456"  # Use the OTP from console/logs
    userDetails: {
      name: "Test User"
      email: "test@example.com"
    }
  ) {
    token
    user {
      id
      name
      mobile
      email
    }
  }
}
```

**Copy the `token` from the response** and use it in the Authorization header:
```
Authorization: Bearer <your-token-here>
```

---

## 1. Centers Testing

### Query All Centers
```graphql
query GetAllCenters {
  centers {
    id
    name
    address
    city
    isActive
    createdAt
  }
}
```

### Query Centers by City
```graphql
query GetCentersByCity {
  centers(city: "Mumbai") {
    id
    name
    address
    city
  }
}
```

### Query Single Center
```graphql
query GetCenter {
  center(id: "CENTER_ID_HERE") {
    id
    name
    address
    city
    isActive
  }
}
```

---

## 2. Consultants Testing

### Query All Consultants
```graphql
query GetAllConsultants {
  consultants {
    id
    name
    specialty
    experience
    rating
    centerId
    center {
      id
      name
      city
    }
    isActive
  }
}
```

### Query Consultants by Center
```graphql
query GetConsultantsByCenter {
  consultants(centerId: "CENTER_ID_HERE") {
    id
    name
    specialty
    experience
    rating
    center {
      name
      city
    }
  }
}
```

### Query Consultants by Specialty
```graphql
query GetConsultantsBySpecialty {
  consultants(specialty: "Orthopedic") {
    id
    name
    specialty
    experience
    rating
  }
}
```

### Query Single Consultant
```graphql
query GetConsultant {
  consultant(id: "CONSULTANT_ID_HERE") {
    id
    name
    specialty
    experience
    rating
    center {
      id
      name
      address
    }
  }
}
```

---

## 3. Appointments Testing

### Check Availability
```graphql
query CheckAvailability {
  checkAvailability(
    consultantId: "CONSULTANT_ID_HERE"
    date: "2024-12-25"
    time: "10:00 AM"
  )
}
```

### Create Appointment
```graphql
mutation CreateAppointment {
  createAppointment(
    input: {
      consultantId: "CONSULTANT_ID_HERE"
      centerId: "CENTER_ID_HERE"
      date: "2024-12-25"
      time: "10:00 AM"
      type: in-person
      bookingFee: 150
    }
  ) {
    id
    patientId
    consultantId
    centerId
    consultant {
      id
      name
      specialty
    }
    center {
      id
      name
      city
    }
    date
    time
    type
    status
    bookingFee
    createdAt
  }
}
```

### Query All Appointments (Current User)
```graphql
query GetMyAppointments {
  appointments {
    id
    consultant {
      name
      specialty
    }
    center {
      name
      city
    }
    date
    time
    type
    status
    bookingFee
  }
}
```

### Query Appointments by Status
```graphql
query GetBookedAppointments {
  appointments(status: booked) {
    id
    consultant {
      name
      specialty
    }
    date
    time
    status
  }
}
```

### Query Single Appointment
```graphql
query GetAppointment {
  appointment(id: "APPOINTMENT_ID_HERE") {
    id
    consultant {
      id
      name
      specialty
      experience
    }
    center {
      id
      name
      address
      city
    }
    date
    time
    type
    status
    bookingFee
    createdAt
    updatedAt
  }
}
```

### Update Appointment
```graphql
mutation UpdateAppointment {
  updateAppointment(
    id: "APPOINTMENT_ID_HERE"
    input: {
      date: "2024-12-26"
      time: "11:00 AM"
      status: booked
    }
  ) {
    id
    date
    time
    status
    consultant {
      name
    }
  }
}
```

### Cancel Appointment
```graphql
mutation CancelAppointment {
  cancelAppointment(id: "APPOINTMENT_ID_HERE") {
    id
    status
    consultant {
      name
    }
    date
    time
  }
}
```

---

## 4. Error Testing Scenarios

### Test: Invalid Consultant ID
```graphql
mutation CreateAppointmentInvalidConsultant {
  createAppointment(
    input: {
      consultantId: "invalid-id"
      centerId: "CENTER_ID_HERE"
      date: "2024-12-25"
      time: "10:00 AM"
      type: in-person
    }
  ) {
    id
  }
}
```
**Expected:** Error with code `INVALID_INPUT`

### Test: Consultant Not Belonging to Center
```graphql
mutation CreateAppointmentWrongCenter {
  createAppointment(
    input: {
      consultantId: "CONSULTANT_ID_FROM_DIFFERENT_CENTER"
      centerId: "DIFFERENT_CENTER_ID"
      date: "2024-12-25"
      time: "10:00 AM"
      type: in-person
    }
  ) {
    id
  }
}
```
**Expected:** Error "Consultant does not belong to the specified center"

### Test: Time Slot Conflict
```graphql
# First, create an appointment
mutation CreateFirstAppointment {
  createAppointment(
    input: {
      consultantId: "CONSULTANT_ID_HERE"
      centerId: "CENTER_ID_HERE"
      date: "2024-12-25"
      time: "10:00 AM"
      type: in-person
    }
  ) {
    id
  }
}

# Then try to create another at the same time
mutation CreateConflictingAppointment {
  createAppointment(
    input: {
      consultantId: "SAME_CONSULTANT_ID"
      centerId: "SAME_CENTER_ID"
      date: "2024-12-25"
      time: "10:00 AM"
      type: in-person
    }
  ) {
    id
  }
}
```
**Expected:** Error with code `CONFLICT` - "Time slot is already booked"

### Test: Unauthorized Access
Try to query appointments without authentication:
```graphql
query GetAppointmentsWithoutAuth {
  appointments {
    id
  }
}
```
**Expected:** Error with code `UNAUTHENTICATED`

### Test: Access Other User's Appointment
```graphql
query GetOtherUserAppointment {
  appointment(id: "ANOTHER_USER_APPOINTMENT_ID") {
    id
  }
}
```
**Expected:** Error with code `NOT_FOUND`

---

## 5. Complete Test Flow

Here's a complete test flow you can follow:

### Step 1: Setup Data (if not already created)
You'll need to manually create centers and consultants in the database first, or add mutations for them.

### Step 2: Authenticate
```graphql
mutation Auth {
  verifyOTP(
    mobile: "9876543210"
    otp: "123456"
    userDetails: {
      name: "Test Patient"
      email: "patient@test.com"
    }
  ) {
    token
    user {
      id
    }
  }
}
```

### Step 3: Get Centers
```graphql
query Centers {
  centers {
    id
    name
    city
  }
}
```

### Step 4: Get Consultants
```graphql
query Consultants {
  consultants {
    id
    name
    specialty
    centerId
    center {
      name
    }
  }
}
```

### Step 5: Check Availability
```graphql
query Check {
  checkAvailability(
    consultantId: "CONSULTANT_ID"
    date: "2024-12-25"
    time: "10:00 AM"
  )
}
```

### Step 6: Create Appointment
```graphql
mutation Book {
  createAppointment(
    input: {
      consultantId: "CONSULTANT_ID"
      centerId: "CENTER_ID"
      date: "2024-12-25"
      time: "10:00 AM"
      type: in-person
    }
  ) {
    id
    status
    consultant {
      name
    }
    center {
      name
    }
  }
}
```

### Step 7: View My Appointments
```graphql
query MyAppointments {
  appointments {
    id
    date
    time
    status
    consultant {
      name
      specialty
    }
  }
}
```

### Step 8: Update Appointment
```graphql
mutation Update {
  updateAppointment(
    id: "APPOINTMENT_ID"
    input: {
      status: completed
    }
  ) {
    id
    status
  }
}
```

### Step 9: Cancel Appointment
```graphql
mutation Cancel {
  cancelAppointment(id: "APPOINTMENT_ID") {
    id
    status
  }
}
```

---

## Notes

1. **Replace IDs**: Replace all placeholder IDs (`CENTER_ID_HERE`, `CONSULTANT_ID_HERE`, etc.) with actual IDs from your database.

2. **Date Format**: Use ISO date format: `"YYYY-MM-DD"` (e.g., `"2024-12-25"`)

3. **Time Format**: Use string format like `"10:00 AM"` or `"14:30"`

4. **Authentication**: Remember to include the JWT token in the Authorization header for protected queries/mutations.

5. **Database Setup**: You may need to manually insert test centers and consultants into MongoDB first, or we can add mutations for creating them.

---

## Quick Test Checklist

- [ ] Query all centers
- [ ] Query centers by city
- [ ] Query all consultants
- [ ] Query consultants by center
- [ ] Query consultants by specialty
- [ ] Check appointment availability
- [ ] Create appointment
- [ ] Query my appointments
- [ ] Query appointments by status
- [ ] Update appointment
- [ ] Cancel appointment
- [ ] Test time slot conflict prevention
- [ ] Test invalid consultant/center IDs
- [ ] Test unauthorized access

