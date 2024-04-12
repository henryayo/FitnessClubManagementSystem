-- Members Table
CREATE TABLE members (
    memberId SERIAL PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(100),
    password VARCHAR(100),
    fitnessGoals TEXT,
    healthMetrics TEXT,
    registrationDate DATE
);

-- Trainers Table
CREATE TABLE trainers (
    trainerId SERIAL PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    specialization TEXT
);

-- Equipment Table
CREATE TABLE equipment (
    equipmentId SERIAL PRIMARY KEY,
    equipmentName VARCHAR(50),
    equipmentType VARCHAR(50),
    purchaseDate DATE,
    warrantyExpiry DATE,
    nextMaintenanceDate DATE
);

-- Employees Table (with Admin)
CREATE TABLE employees (
    employeeId SERIAL PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    role VARCHAR(50),
    taskDetails TEXT
);

-- Rooms Table
CREATE TABLE rooms (
    roomId SERIAL PRIMARY KEY,
    roomName VARCHAR(50),
    capacity INT
);

-- Room Bookings Table
CREATE TABLE room_bookings (
    bookingId SERIAL PRIMARY KEY,
    roomId INT,
    bookingTime TIMESTAMP,
    duration INT, -- in minutes
    FOREIGN KEY (roomId) REFERENCES rooms(roomId)
);


-- Classes Table
CREATE TABLE classes (
    classId SERIAL PRIMARY KEY,
    className VARCHAR(50),
    roomId INT,
    trainerId INT,
    classTime TIMESTAMP,
    FOREIGN KEY (roomId) REFERENCES rooms(roomId),
    FOREIGN KEY (trainerId) REFERENCES trainers(trainerId)
);

-- Schedule Table (for personal training sessions)
CREATE TABLE schedule (
    scheduleId SERIAL PRIMARY KEY,
    memberId INT,
    trainerId INT,
    scheduledTime TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (memberId) REFERENCES members(memberId),
    FOREIGN KEY (trainerId) REFERENCES trainers(trainerId)
);

-- Workout Set Table
CREATE TABLE sets (
    setId SERIAL PRIMARY KEY,
    memberId INT,
    description TEXT,
    FOREIGN KEY (memberId) REFERENCES members(memberId)
);

-- CustomWorkoutPlans Table
CREATE TABLE customWorkoutPlans (
    planId SERIAL PRIMARY KEY,
    memberId INT,
    trainerId INT,
    planDetails TEXT,
    creationDate TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES members(memberId),
    FOREIGN KEY (trainerId) REFERENCES trainers(trainerId)
);

-- NutritionLogs Table
CREATE TABLE nutritionLogs (
    logId SERIAL PRIMARY KEY,
    memberId INT,
    logDate DATE,
    mealType VARCHAR(50),
    food TEXT,
    calories INT,
    FOREIGN KEY (memberId) REFERENCES members(memberId)
);

-- Feedback Table
CREATE TABLE feedback (
    feedbackId SERIAL PRIMARY KEY,
    memberId INT,
    trainerId INT,
    classId INT,
    feedbackText TEXT,
    rating INT,
    date TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES members(memberId),
    FOREIGN KEY (trainerId) REFERENCES trainers(trainerId),
    FOREIGN KEY (classId) REFERENCES classes(classId)
);

-- Receipts Table
CREATE TABLE receipts (
    receiptId SERIAL PRIMARY KEY,
    memberId INT,
    amount DECIMAL(10, 2),
    paymentDate TIMESTAMP,
    specialDesc TEXT,
    FOREIGN KEY (memberId) REFERENCES members(memberId)
);