import inquirer from "inquirer";
import { query } from "./db.js";

const viewAvailability = async () => {
  const trainersQuery =
    "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainersResult = await query(trainersQuery);
  const trainerChoices = trainersResult.rows.map((trainer) => ({
    name: trainer.trainername,
    value: trainer.trainerid,
  }));

  const answer = await inquirer.prompt([
    {
      name: "trainerId",
      type: "list",
      message: "Select a Trainer to view availability:",
      choices: trainerChoices,
    },
  ]);

  const availabilityQuery = `
    SELECT scheduleId, TO_CHAR(scheduledTime, 'YYYY-MM-DD HH24:MI') AS availableTime, status
    FROM schedule
    WHERE trainerId = $1 AND status = 'Available'
    ORDER BY scheduledTime ASC;
  `;

  try {
    const { rows } = await query(availabilityQuery, [answer.trainerId]);
    if (rows.length === 0) {
      console.log("No availability found for the selected trainer.");
      return;
    }

    console.log(
      `Availability for ${
        trainerChoices.find((t) => t.value === answer.trainerId).name
      }:`
    );
    console.table(
      rows.map((row) => ({
        "Schedule ID": row.scheduleid,
        "Available Time": row.availabletime,
        Status: row.status,
      }))
    );
  } catch (error) {
    console.error(`Failed to retrieve availability: ${error.message}`);
  }
};

const setAvailability = async () => {
  const trainersQuery =
    "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainersResult = await query(trainersQuery);
  const trainerChoices = trainersResult.rows.map((trainer) => ({
    name: trainer.trainername,
    value: trainer.trainerid,
  }));

  const answersTrainer = await inquirer.prompt([
    {
      name: "trainerId",
      type: "list",
      message: "Select a Trainer:",
      choices: trainerChoices,
    },
  ]);

  const answersTime = await inquirer.prompt([
    {
      name: "availableTime",
      type: "input",
      message: "Available Time (YYYY-MM-DD HH:MM):",
      validate: (value) => {
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
          return "Please enter a valid date and time in 'YYYY-MM-DD HH:MM' format.";
        }
        return true;
      },
    },
  ]);

  const queryText = `
    INSERT INTO schedule (trainerId, scheduledTime, status) 
    VALUES ($1, TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI'), 'Available') RETURNING scheduleId
  `;
  try {
    const { rows } = await query(queryText, [
      answersTrainer.trainerId,
      answersTime.availableTime,
    ]);
    console.log(
      `Availability set successfully with Schedule ID: ${rows[0].scheduleid}`
    );
  } catch (error) {
    console.error(`Setting availability failed: ${error.message}`);
  }
};

const viewMemberSession = async () => {
  const trainersQuery = "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainersResult = await query(trainersQuery);
  const trainerChoices = trainersResult.rows.map(trainer => ({
    name: trainer.trainername,
    value: trainer.trainerid
  }));

  const selectedTrainer = await inquirer.prompt([
    {
      name: "trainerId",
      type: "list",
      message: "Select your name to view booked sessions:",
      choices: trainerChoices
    }
  ]);

  const sessionQuery = `
    SELECT s.scheduleId, m.firstName || ' ' || m.lastName AS memberName, TO_CHAR(s.scheduledTime, 'YYYY-MM-DD HH24:MI') AS scheduledTime, s.status
    FROM schedule s
    JOIN members m ON s.memberId = m.memberId
    WHERE s.trainerId = $1 AND s.status = 'Scheduled'
    ORDER BY s.scheduledTime ASC;
  `;
  try {
    const { rows } = await query(sessionQuery, [selectedTrainer.trainerId]);
    if (rows.length === 0) {
      console.log("No sessions booked with you.");
    } else {
      console.log(`Sessions booked with ${trainerChoices.find(t => t.value === selectedTrainer.trainerId).name}:`);
      console.table(rows);
    }
  } catch (error) {
    console.error(`Failed to retrieve sessions: ${error.message}`);
  }
};

const cancelSession = async () => {
  const trainerQuery = "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainerResults = await query(trainerQuery);
  const trainerChoices = trainerResults.rows.map(trainer => ({
    name: trainer.trainername,
    value: trainer.trainerid
  }));

  const selectedTrainer = await inquirer.prompt([
    {
      name: "trainerId",
      type: "list",
      message: "Select your name to cancel a session:",
      choices: trainerChoices
    }
  ]);

  const sessionsQuery = `
    SELECT s.scheduleId, m.firstName || ' ' || m.lastName AS memberName, TO_CHAR(s.scheduledTime, 'YYYY-MM-DD HH24:MI') AS scheduledTime
    FROM schedule s
    JOIN members m ON s.memberId = m.memberId
    WHERE s.trainerId = $1 AND s.status = 'Scheduled'
    ORDER BY s.scheduledTime;
  `;
  const sessions = await query(sessionsQuery, [selectedTrainer.trainerId]);

  if (sessions.rows.length === 0) {
    console.log("No scheduled sessions to cancel.");
    return;
  }

  const sessionChoices = sessions.rows.map(session => ({
    name: `${session.membername} - ${session.scheduledtime}`,
    value: session.scheduleid
  }));

  const sessionToCancel = await inquirer.prompt([
    {
      name: "scheduleId",
      type: "list",
      message: "Select the session you want to cancel:",
      choices: sessionChoices
    }
  ]);

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmCancel',
      message: 'Are you sure you want to cancel this session?',
      default: false
    }
  ]);

  if (confirm.confirmCancel) {
    const deleteQuery = "DELETE FROM schedule WHERE scheduleId = $1";
    try {
      const result = await query(deleteQuery, [sessionToCancel.scheduleId]);
      console.log("Session cancelled successfully.");
    } catch (error) {
      console.error(`Error cancelling the session: ${error.message}`);
    }
  } else {
    console.log("Session cancellation aborted.");
  }
};

const viewMemberProfile = async () => {
  const answers = await inquirer.prompt([
    {
      name: "memberId",
      type: "input",
      message: "Enter Member ID to view profile:",
    },
  ]);

  const queryText = "SELECT * FROM members WHERE memberId = $1";
  try {
    const { rows } = await query(queryText, [answers.memberId]);
    if (rows.length > 0) {
      console.log(`Member Profile:`);
      console.table(rows[0]);
    } else {
      console.log("No member found with the provided ID.");
    }
  } catch (error) {
    console.error(`Failed to retrieve member profile: ${error.message}`);
  }
};

const viewWorkoutPlan = async () => {
  const trainersQuery =
    "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainersResult = await query(trainersQuery);
  const trainerChoices = trainersResult.rows.map((trainer) => ({
    name: trainer.trainername,
    value: trainer.trainerid,
  }));

  const answer = await inquirer.prompt([
    {
      name: "trainerId",
      type: "list",
      message: "Select a Trainer to view workout plans:",
      choices: trainerChoices,
    },
  ]);

  const workoutPlanQuery = `
    SELECT p.planId, p.memberId, m.firstName || ' ' || m.lastName AS memberName, p.planDetails, TO_CHAR(p.creationDate, 'YYYY-MM-DD') AS creationDate
    FROM customWorkoutPlans p
    JOIN members m ON p.memberId = m.memberId
    WHERE p.trainerId = $1
    ORDER BY p.creationDate DESC;
  `;

  try {
    const { rows } = await query(workoutPlanQuery, [answer.trainerId]);
    if (rows.length === 0) {
      console.log("No workout plans found for the selected trainer.");
      return;
    }

    console.log(
      `Workout Plans for ${
        trainerChoices.find((t) => t.value === answer.trainerId).name
      }:`
    );
    console.table(
      rows.map((plan) => ({
        "Plan ID": plan.planid,
        "Member Name": plan.membername,
        "Plan Details": plan.plandetails,
        "Creation Date": plan.creationdate,
      }))
    );
  } catch (error) {
    console.error(`Failed to retrieve workout plans: ${error.message}`);
  }
};

const createWorkoutPlan = async () => {
  const trainersQuery =
    "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainersResult = await query(trainersQuery);
  const trainerChoices = trainersResult.rows.map((trainer) => ({
    name: trainer.trainername,
    value: trainer.trainerid,
  }));

  const membersQuery =
    "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const membersResult = await query(membersQuery);
  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));

  const answers = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select a Member:",
      choices: memberChoices,
    },
    {
      name: "trainerId",
      type: "list",
      message: "Select a Trainer:",
      choices: trainerChoices,
    },
    { name: "planDetails", type: "input", message: "Workout Plan Details:" },
  ]);

  const queryText = `
    INSERT INTO customWorkoutPlans (memberId, trainerId, planDetails, creationDate)
    VALUES ($1, $2, $3, NOW()) RETURNING planId
  `;
  try {
    const { rows } = await query(queryText, [
      answers.memberId,
      answers.trainerId,
      answers.planDetails,
    ]);
    console.log(
      `Workout plan created successfully with Plan ID: ${rows[0].planid}`
    );
  } catch (error) {
    console.error(`Failed to create workout plan: ${error.message}`);
  }
};

const trainerMenu = async () => {
  const action = await inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "Choose a trainer action:",
      choices: [
        "View Availability",
        "Set Availability",
        "View Member Session",
        "Cancel Session",
        "View Member Profile",
        "View Workout Plan",
        "Create Workout Plan",
        "Exit",
      ],
    },
  ]);

  switch (action.action) {
    case "View Availability":
      await viewAvailability();
      break;
    case "Set Availability":
      await setAvailability();
      break;
    case "View Member Session":
      await viewMemberSession();
      break;
    case "Cancel Session":
      await cancelSession();
      break;
    case "View Member Profile":
      await viewMemberProfile();
      break;
    case "View Workout Plan":
      await viewWorkoutPlan();
      break;
    case "Create Workout Plan":
      await createWorkoutPlan();
      break;
    case "Exit":
      console.log("Exiting Trainer Menu...");
      return;
  }
  await trainerMenu();
};

export default trainerMenu;
