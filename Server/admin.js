import inquirer from "inquirer";
import { query } from "./db.js";

const bookRoom = async () => {
  const roomOptions = [
    { name: "Cardio Zone", capacity: 20 },
    { name: "Strength Training Area", capacity: 15 },
    { name: "Yoga Studio", capacity: 15 },
  ];

  const answers = await inquirer.prompt([
    {
      name: "roomName",
      type: "list",
      message: "Room Name:",
      choices: roomOptions.map((option) => option.name),
    },
    {
      name: "bookingTime",
      type: "input",
      message: "Booking Start Time (YYYY-MM-DD HH:MM):",
      validate: (value) => {
        const pass = value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        if (pass) {
          return true;
        }
        return 'Please enter a valid start time in "YYYY-MM-DD HH:MM" format.';
      },
    },
    {
      name: "duration",
      type: "input",
      message: "Duration (in minutes):",
      validate: (value) => {
        const pass = value.match(/^[1-9]\d*$/);
        if (pass) {
          return true;
        }
        return "Please enter a valid duration in minutes.";
      },
    },
  ]);

  try {
    const selectedRoom = roomOptions.find(
      (option) => option.name === answers.roomName
    );
    const roomIdQuery = "SELECT roomId FROM rooms WHERE roomName = $1";
    const roomResult = await query(roomIdQuery, [answers.roomName]);
    if (roomResult.rows.length === 0) {
      console.log("Room not found.");
      return;
    }
    const roomId = roomResult.rows[0].roomId;

    const bookingCheckQuery = `
      SELECT COUNT(*) FROM room_bookings
      WHERE roomId = $1 AND NOT (
        bookingTime + interval '1 minute' * duration < TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI') OR
        bookingTime > TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI') + interval '1 minute' * $3
      )
    `;
    const bookingCheckResult = await query(bookingCheckQuery, [
      roomId,
      answers.bookingTime,
      answers.duration,
    ]);
    const totalBooked = parseInt(bookingCheckResult.rows[0].count, 10);

    if (totalBooked >= selectedRoom.capacity) {
      console.log(
        "This room is fully booked at the specified time. Please choose a different time or room."
      );
      return;
    }

    const bookingQuery = `
      INSERT INTO room_bookings (roomId, bookingTime, duration)
      VALUES ($1, TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI'), $3) RETURNING bookingId
    `;
    const bookingResult = await query(bookingQuery, [
      roomId,
      answers.bookingTime,
      answers.duration,
    ]);
    console.log(
      `Room booked successfully with Booking ID: ${bookingResult.rows[0].bookingid}`
    );
  } catch (error) {
    console.error(`Room booking failed: ${error.message}`);
  }
};

const monitorEquipmentMaintenance = async () => {
  const futureDate = "2025-09-02";

  const queryText = `
    SELECT equipmentId, equipmentName, TO_CHAR(nextMaintenanceDate, 'YYYY-MM-DD') AS dueDate
    FROM equipment
    WHERE nextMaintenanceDate <= '${futureDate}'
    ORDER BY nextMaintenanceDate ASC;
  `;

  try {
    const { rows } = await query(queryText);
    if (rows.length === 0) {
      console.log("No equipment currently requires maintenance.");
      return;
    }

    const equipmentChoices = rows.map((row) => ({
      name: row.equipmentname,
      value: { name: row.equipmentname, dueDate: row.duedate },
    }));

    const answer = await inquirer.prompt([
      {
        name: "selectedEquipment",
        type: "list",
        message: "Select equipment to check its maintenance schedule:",
        choices: equipmentChoices,
      },
    ]);

    console.log(
      `${answer.selectedEquipment.name} is due for maintenance on ${answer.selectedEquipment.dueDate}.`
    );
  } catch (error) {
    console.error(
      `Failed to retrieve equipment maintenance data: ${error.message}`
    );
  }
};

const viewClassSchedule = async () => {
  const queryText = `
    SELECT c.classId, c.className, c.trainerId, TO_CHAR(c.classTime, 'YYYY-MM-DD HH24:MI') AS classTime
    FROM classes c
    ORDER BY c.classTime ASC;
  `;

  try {
    const { rows } = await query(queryText);
    if (rows.length === 0) {
      console.log("No classes scheduled.");
      return;
    }

    console.log("Current Class Schedule:");
    console.table(
      rows.map((row) => ({
        "Class ID": row.classid,
        "Class Name": row.classname,
        "Trainer ID": row.trainerid,
        "Class Time": row.classtime,
      }))
    );
  } catch (error) {
    console.error(`Failed to retrieve class schedule: ${error.message}`);
  }
};

const updateClassSchedule = async () => {
  const classesQuery =
    "SELECT classId, className FROM classes ORDER BY classTime ASC";
  const classesResult = await query(classesQuery);
  const classChoices = classesResult.rows.map((row) => ({
    name: row.classname,
    value: row.classid,
  }));

  const answersClass = await inquirer.prompt([
    {
      name: "classId",
      type: "list",
      message: "Select a class to update:",
      choices: classChoices,
    },
  ]);

  const answersTime = await inquirer.prompt([
    {
      name: "newTime",
      type: "input",
      message: "New Class Time (YYYY-MM-DD HH:MM):",
      validate: (value) => {
        const pass = value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        if (pass) {
          return true;
        }
        return 'Please enter a valid time in "YYYY-MM-DD HH:MM" format.';
      },
    },
  ]);

  const updateQuery =
    "UPDATE classes SET classTime = TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI') WHERE classId = $1";
  try {
    await query(updateQuery, [answersClass.classId, answersTime.newTime]);
    console.log("Class schedule updated successfully.");
  } catch (error) {
    console.error(`Failed to update class schedule: ${error.message}`);
  }
};

const processBillingAndPayment = async () => {
  const answers = await inquirer.prompt([
    {
      name: "memberId",
      type: "input",
      message: "Member ID for billing:",
      validate: async (value) => {
        const queryText = "SELECT * FROM members WHERE memberId = $1";
        const result = await query(queryText, [value]);
        return result.rows.length > 0 ? true : "Member ID does not exist.";
      },
    },
    {
      name: "amount",
      type: "input",
      message: "Billing Amount:",
      validate: (value) => {
        const pass = value.match(/^[0-9]+(\.[0-9]{1,2})?$/);
        return pass ? true : "Please enter a valid amount.";
      },
    },
    { name: "description", type: "input", message: "Payment Description:" },
  ]);

  const queryText =
    "INSERT INTO receipts (memberId, amount, paymentDate, specialDesc) VALUES ($1, $2, NOW(), $3) RETURNING receiptid";
  try {
    const { rows } = await query(queryText, [
      answers.memberId,
      answers.amount,
      answers.description,
    ]);
    if (rows.length > 0 && rows[0].receiptid) {
      console.log(
        `Billing processed successfully with Receipt ID: ${rows[0].receiptid}`
      );
    } else {
      throw new Error("Failed to process billing, no Receipt ID returned.");
    }
  } catch (error) {
    console.error(`Billing process failed: ${error.message}`);
  }
};

const adminMenu = async () => {
  const action = await inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "Choose an administrative action:",
      choices: [
        "Book Room",
        "Monitor Equipment Maintenance",
        "View Class Schedule",
        "Update Class Schedule",
        "Process Billing and Payment",
        "Exit",
      ],
    },
  ]);

  switch (action.action) {
    case "Book Room":
      await bookRoom();
      break;
    case "Monitor Equipment Maintenance":
      await monitorEquipmentMaintenance();
      break;
    case "View Class Schedule":
      await viewClassSchedule();
      break;
    case "Update Class Schedule":
      await updateClassSchedule();
      break;
    case "Process Billing and Payment":
      await processBillingAndPayment();
      break;
    case "Exit":
      console.log("Exiting Admin Menu...");
      return;
  }
  await adminMenu();
};

export default adminMenu;
