-- Inserting Members
INSERT INTO members (firstName, lastName, email, fitnessGoals, healthMetrics, registrationDate) VALUES
('Alex', 'Jones', 'alex.j@gmail.com', 'Lose 10kg, Increase stamina', 'Weight: 80kg, Blood Pressure: 120/80', '2024-01-01'),
('Jamie', 'Carragher', 'jamie.l@gmail.com', 'Gain 5kg muscle, Improve flexibility', 'Weight: 60kg, Muscle Mass: 20%', '2024-01-02'),
('Morgan', 'Smith', 'morgan.s@gmail.com', 'Improve cardio endurance, Tone muscles', 'Weight: 70kg, BMI: 22', '2024-01-03'),
('Taylor', 'Brown', 'taylor.b@gmail.com', 'Increase strength, Improve posture', 'Weight: 65kg, Body Fat: 15%', '2024-01-04'),
('Angel', 'Reese', 'angel.r@gmail.com', 'Enhance flexibility, Reduce stress', 'Weight: 75kg, Stress Level: Moderate', '2024-01-05'),
('Caitlin', 'Clark', 'caitlin.c@gmail.com', 'Improve overall fitness, Boost energy', 'Weight: 55kg, Energy Level: Low', '2024-01-06'),
('Liam', 'White', 'liam.w@gmail.com', 'Build muscle mass, Increase endurance', 'Weight: 85kg, Endurance Level: High', '2024-01-07'),
('Chris', 'Cross', 'chris.c@gmail.com', 'Build muscle mass, Increase endurance', 'Weight: 85kg, Endurance Level: High', '2024-01-07');

-- Inserting Trainers
INSERT INTO trainers (firstName, lastName, specialization) VALUES
('Sam', 'Taylor', 'Cardio Specialist'),
('Chris', 'Diaz', 'Strength Training'),
('Alex', 'Morgan', 'Yoga Instructor');

-- Inserting Employees including Admin
INSERT INTO employees (firstName, lastName, role, taskDetails) VALUES
('Jordan', 'Kai', 'Admin', 'Oversee club operations, Manage staff'),
('Casey', 'River', 'Staff', 'Customer service, Equipment maintenance'),
('Taylor', 'Morgan', 'Staff', 'Front desk duties, Member check-ins'),
('Jeremy', 'Walker', 'Staff', 'Cleaning, Facility maintenance');

-- Inserting Rooms
INSERT INTO rooms (roomName, roomId, capacity) VALUES
('Cardio Zone', 1, 20),
('Strength Training Area', 2, 15),
('Yoga Studio', 3, 15);

ALTER TABLE rooms ADD CONSTRAINT unique_room_name UNIQUE (roomName);

-- Inserting Classes
INSERT INTO classes (className, classId, trainerId, classTime) VALUES
('Morning Cardio Blast', 1, 1, '2024-04-10 07:00:00'),
('Evening Strength Circuit', 2, 2, '2024-04-10 18:00:00'),
('Yoga Flow', 3, 3, '2024-04-10 10:00:00');

-- Inserting Schedules (Personal Training Sessions)
INSERT INTO schedule (memberId, trainerId, scheduledTime, status) VALUES
(1, 1, '2024-04-12 08:00:00', 'Scheduled'),
(2, 2, '2024-04-12 17:00:00', 'Scheduled'),
(3, 1, '2024-04-13 09:00:00', 'Scheduled'),
(4, 2, '2024-04-13 16:00:00', 'Scheduled');

-- Inserting Member's Workout Sets
INSERT INTO sets (memberId, description) VALUES
(1, 'Treadmill: 30min, Incline: 5, Speed: 6.5'),
(2, 'Deadlifts: 4 sets of 8 reps, Weight: 60kg'),
(3, 'Elliptical: 45min, Resistance: 8'),
(4, 'Squats: 3 sets of 10 reps, Weight: 40kg');

-- Inserting Equipment
INSERT INTO equipment (equipmentName, equipmentType, purchaseDate, warrantyExpiry, nextMaintenanceDate) VALUES
('Treadmill', 'Cardio', '2024-01-01', '2026-01-01', '2024-07-01'),
('Dumbbells', 'Strength', '2024-01-02', '2026-01-02', '2024-07-02'),
('Elliptical Machine', 'Cardio', '2024-01-03', '2026-01-03', '2024-07-03'),
('Barbell', 'Strength', '2024-01-04', '2026-01-04', '2024-07-04');

-- Inserting Custom Workout Plans
INSERT INTO customWorkoutPlans (memberId, trainerId, planDetails, creationDate) VALUES
(1, 1, 'Cardio: 30min, Strength: 30min, Yoga: 30min', '2024-04-01 00:00:00'),
(2, 2, 'Strength Training: 45min, Cardio: 30min', '2024-04-01 00:00:00'),
(3, 1, 'Cardio: 45min, Strength: 30min', '2024-04-01 00:00:00'),
(4, 2, 'Strength Training: 60min, Cardio: 30min', '2024-04-01 00:00:00');

-- Inserting Nutrition Logs
INSERT INTO nutritionLogs (memberId, logDate, mealType, food, calories) VALUES
(1, '2024-04-01', 'Breakfast', 'Oatmeal with fruits and nuts', 300),
(1, '2024-04-01', 'Lunch', 'Grilled chicken salad', 400),
(1, '2024-04-01', 'Dinner', 'Salmon with quinoa and vegetables', 500),
(2, '2024-04-01', 'Breakfast', 'Eggs with avocado toast', 350),
(2, '2024-04-01', 'Lunch', 'Turkey sandwich with sweet potato fries', 450),
(2, '2024-04-01', 'Dinner', 'Pasta with marinara sauce and vegetables', 550),
(3, '2024-04-01', 'Breakfast', 'Greek yogurt with granola and berries', 300),
(3, '2024-04-01', 'Lunch', 'Quinoa bowl with tofu and vegetables', 400),
(3, '2024-04-01', 'Dinner', 'Stir-fried shrimp with brown rice', 500),
(4, '2024-04-01', 'Breakfast', 'Smoothie with spinach, banana, and protein powder', 350),
(4, '2024-04-01', 'Lunch', 'Grilled salmon with asparagus and quinoa', 450),
(4, '2024-04-01', 'Dinner', 'Chicken stir-fry with broccoli and rice', 550);

-- Inserting Feedback
INSERT INTO feedback (memberId, trainerId, classId, feedbackText, rating, date) VALUES
(1, 1, 1, 'Great workout, loved the energy!', 5, '2024-04-10 08:00:00'),
(2, 2, 2, 'Awesome class, really pushed me!', 5, '2024-04-10 19:00:00'),
(3, 1, 1, 'Enjoyed the cardio session, felt the burn!', 4, '2024-04-10 09:00:00'),
(4, 2, 2, 'Challenging workout, loved the variety!', 4, '2024-04-10 18:00:00');

-- Inserting Receipts/Invoices
INSERT INTO receipts (memberId, amount, paymentDate, specialDesc) VALUES
(1, 50.00, '2024-04-01 00:00:00', 'April Membership Fee'),
(2, 70.00, '2024-04-01 00:00:00', 'April Membership Fee + Personal Training Session'),
(3, 60.00, '2024-04-01 00:00:00', 'April Membership Fee + Golf Club Access'),
(4, 80.00, '2024-04-01 00:00:00', 'April Membership Fee + Personal Training Session + Golf Club Access'),
(5, 50.00, '2024-04-01 00:00:00', 'April Membership Fee'),
(6, 70.00, '2024-04-01 00:00:00', 'April Membership Fee + Personal Training Session'),
(7, 60.00, '2024-04-01 00:00:00', 'April Membership Fee + Golf Club Access'),
(8, 80.00, '2024-04-01 00:00:00', 'April Membership Fee + Personal Training Session + Golf Club Access');