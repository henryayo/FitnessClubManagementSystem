import inquirer from "inquirer";
import { query } from "./db.js";

const registerMember = async () => {
  const answers = await inquirer.prompt([
    { name: "firstName", type: "input", message: "First Name:" },
    { name: "lastName", type: "input", message: "Last Name:" },
    { name: "email", type: "input", message: "Email:" },
    { name: "password", type: "password", message: "Password:", mask: "*" },
    { name: "fitnessGoals", type: "input", message: "Fitness Goals:" },
    {
      name: "healthMetrics",
      type: "input",
      message: "Health Metrics (e.g., Weight, BMI):",
    },
    {
      name: "registrationDate",
      type: "input",
      message: "Registration Date (YYYY-MM-DD):",
    },
  ]);

  const queryText = `
    INSERT INTO members (firstName, lastName, email, password, fitnessGoals, healthMetrics, registrationDate) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING memberId
  `;
  try {
    const { rows } = await query(queryText, Object.values(answers));
    console.log(`Member registered with ID: ${rows[0].memberid}`);
  } catch (error) {
    console.error(`Registration failed: ${error.message}`);
  }
};

const updateProfile = async () => {
  const memberId = await inquirer.prompt([
    { name: "memberId", type: "input", message: "Enter your Member ID:" },
  ]);

  const answers = await inquirer.prompt([
    { name: "email", type: "input", message: "Update Email:" },
    { name: "fitnessGoals", type: "input", message: "Update Fitness Goals:" },
    {
      name: "healthMetrics",
      type: "input",
      message: "Update Health Metrics (e.g., Weight, BMI):",
    },
  ]);

  const queryText = `
    UPDATE members
    SET email = $1, fitnessGoals = $2, healthMetrics = $3
    WHERE memberId = $4
  `;
  try {
    await query(queryText, [...Object.values(answers), memberId.memberId]);
    console.log(`Member profile updated successfully.`);
  } catch (error) {
    console.error(`Profile update failed: ${error.message}`);
  }
};

const viewDashboard = async () => {
  const membersQuery = "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const membersResult = await query(membersQuery);
  if (membersResult.rows.length === 0) {
    console.log("No members found.");
    return;
  }

  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));

  const memberIdPrompt = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select a member to view the dashboard:",
      choices: memberChoices,
    },
  ]);

  const memberId = memberIdPrompt.memberId;
  const queryText = `
    SELECT firstName, lastName, email, fitnessGoals, healthMetrics, TO_CHAR(registrationDate, 'YYYY-MM-DD') AS registrationDate 
    FROM members 
    WHERE memberId = $1;
  `;

  try {
    const { rows } = await query(queryText, [memberId]);
    if (rows.length === 0) {
      console.log(`No member found with ID ${memberId}. Please check the ID and try again.`);
    } else {
      console.log(`Member Dashboard for ${rows[0].firstname} ${rows[0].lastname}:`);
      delete rows[0].password; 
      console.table(rows[0]);
    }
  } catch (error) {
    console.error(`Failed to retrieve dashboard: ${error.message}`);
  }
};



const viewScheduleSession = async () => {
  const membersQuery =
    "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const membersResult = await query(membersQuery);
  if (membersResult.rows.length === 0) {
    console.log("No members found.");
    return;
  }
  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));

  const answer = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select a member to view scheduled sessions:",
      choices: memberChoices,
    },
  ]);

  const scheduleQuery = `
    SELECT s.scheduleId, t.firstName || ' ' || t.lastName AS trainerName, TO_CHAR(s.scheduledTime, 'YYYY-MM-DD HH24:MI') AS scheduledTime, s.status
    FROM schedule s
    JOIN trainers t ON s.trainerId = t.trainerId
    WHERE s.memberId = $1
    ORDER BY s.scheduledTime ASC;
  `;

  try {
    const { rows } = await query(scheduleQuery, [answer.memberId]);
    if (rows.length === 0) {
      console.log(
        `No scheduled sessions found for Member ID ${answer.memberId}.`
      );
    } else {
      console.log(
        `Scheduled Sessions for ${
          memberChoices.find((m) => m.value === answer.memberId).name
        }:`
      );
      console.table(
        rows.map((session) => ({
          "Schedule ID": session.scheduleid,
          "Trainer Name": session.trainername,
          "Scheduled Time": session.scheduledtime,
          Status: session.status,
        }))
      );
    }
  } catch (error) {
    console.error(`Failed to retrieve scheduled sessions: ${error.message}`);
  }
};

const scheduleSession = async () => {
  const membersQuery =
    "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const membersResult = await query(membersQuery);
  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));

  const trainersQuery =
    "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";
  const trainersResult = await query(trainersQuery);
  const trainerChoices = trainersResult.rows.map((trainer) => ({
    name: trainer.trainername,
    value: trainer.trainerid,
  }));

  const answers = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select your name:",
      choices: memberChoices,
    },
    {
      name: "trainerId",
      type: "list",
      message: "Select your trainer:",
      choices: trainerChoices,
    },
    {
      name: "scheduledTime",
      type: "input",
      message: "Preferred Time for the session (YYYY-MM-DD HH:MM):",
      validate: (value) => {
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
          return "Please enter a valid date and time in 'YYYY-MM-DD HH:MM' format.";
        }
        return true;
      },
    },
  ]);

  const queryText = `
    INSERT INTO schedule (memberId, trainerId, scheduledTime, status)
    VALUES ($1, $2, TO_TIMESTAMP($3, 'YYYY-MM-DD HH24:MI'), 'Scheduled') RETURNING scheduleId
  `;
  try {
    const { rows } = await query(queryText, [
      answers.memberId,
      answers.trainerId,
      answers.scheduledTime,
    ]);
    console.log(
      `Session scheduled successfully with Schedule ID: ${rows[0].scheduleid}`
    );
  } catch (error) {
    console.error(`Scheduling failed: ${error.message}`);
  }
};

const cancelSession = async () => {
  const membersQuery =
    "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const membersResult = await query(membersQuery);
  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));

  const memberAnswer = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select your name to view and cancel scheduled sessions:",
      choices: memberChoices,
    },
  ]);

  const scheduleQuery = `
    SELECT scheduleId, trainerId, TO_CHAR(scheduledTime, 'YYYY-MM-DD HH24:MI') AS scheduledTime, status
    FROM schedule
    WHERE memberId = $1 AND status = 'Scheduled'
    ORDER BY scheduledTime ASC;
  `;
  const { rows } = await query(scheduleQuery, [memberAnswer.memberId]);
  if (rows.length === 0) {
    console.log("You have no scheduled sessions to cancel.");
    return;
  }

  const sessionChoices = rows.map((session) => ({
    name: `${session.scheduledtime} - Status: ${session.status}`,
    value: session.scheduleid,
  }));

  const sessionAnswer = await inquirer.prompt([
    {
      name: "scheduleId",
      type: "list",
      message: "Select the session you wish to cancel:",
      choices: sessionChoices,
    },
  ]);

  const confirmCancel = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure you want to cancel this session?",
      default: false,
    },
  ]);

  if (confirmCancel.confirm) {
    const deleteQuery = `
      DELETE FROM schedule
      WHERE scheduleId = $1 RETURNING scheduleId;
    `;
    try {
      const deleteResult = await query(deleteQuery, [sessionAnswer.scheduleId]);
      if (deleteResult.rows.length > 0) {
        console.log("Session cancelled successfully.");
      } else {
        console.log("Failed to cancel the session.");
      }
    } catch (error) {
      console.error(`Error cancelling the session: ${error.message}`);
    }
  } else {
    console.log("Cancellation aborted.");
  }
};

const viewNutrition = async () => {
  const membersQuery =
    "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const membersResult = await query(membersQuery);
  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));

  const answer = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select a Member to view nutrition logs:",
      choices: memberChoices,
    },
  ]);

  const nutritionQuery = `
    SELECT n.logId, n.logDate, n.mealType, n.food, n.calories
    FROM nutritionLogs n
    WHERE n.memberId = $1
    ORDER BY n.logDate DESC, n.logId ASC;
  `;

  try {
    const { rows } = await query(nutritionQuery, [answer.memberId]);
    if (rows.length === 0) {
      console.log("No nutrition logs found for the selected member.");
      return;
    }

    console.log("Nutrition Logs for the selected member:");
    console.table(
      rows.map((log) => ({
        "Log ID": log.logid,
        Date: log.logdate,
        "Meal Type": log.mealtype,
        Food: log.food,
        Calories: log.calories,
      }))
    );
  } catch (error) {
    console.error(`Failed to retrieve nutrition logs: ${error.message}`);
  }
};

const logNutrition = async () => {
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
      message: "Select your name:",
      choices: memberChoices,
    },
    { name: "logDate", type: "input", message: "Date of Meal (YYYY-MM-DD):" },
    {
      name: "mealType",
      type: "input",
      message: "Type of Meal (e.g., Breakfast, Lunch, Dinner, Snack):",
    },
    { name: "description", type: "input", message: "Meal Description:" },
    { name: "calories", type: "input", message: "Estimated Calories:" },
  ]);

  const queryText = `
    INSERT INTO nutritionLogs (memberId, logDate, mealType, food, calories)
    VALUES ($1, $2, $3, $4, $5) RETURNING logId
  `;
  try {
    const { rows } = await query(queryText, [
      answers.memberId,
      answers.logDate,
      answers.mealType,
      answers.description,
      answers.calories,
    ]);
    console.log(
      `Nutrition log added successfully with Log ID: ${rows[0].logId}`
    );
  } catch (error) {
    console.error(`Failed to add nutrition log: ${error.message}`);
  }
};

const viewFeedback = async () => {
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
      message: "Select a Trainer to view feedback:",
      choices: trainerChoices,
    },
  ]);

  const feedbackQuery = `
    SELECT f.feedbackId, f.memberId, f.feedbackText, f.rating, TO_CHAR(f.date, 'YYYY-MM-DD HH24:MI') AS feedbackDate
    FROM feedback f
    WHERE f.trainerId = $1
    ORDER BY f.date DESC;
  `;

  try {
    const { rows } = await query(feedbackQuery, [answer.trainerId]);
    if (rows.length === 0) {
      console.log("No feedback found for the selected trainer.");
      return;
    }

    console.log("Feedback for the selected trainer:");
    console.table(
      rows.map((feedback) => ({
        "Feedback ID": feedback.feedbackid,
        "Member ID": feedback.memberid,
        Feedback: feedback.feedbacktext,
        Rating: feedback.rating,
        Date: feedback.feedbackdate,
      }))
    );
  } catch (error) {
    console.error(`Failed to retrieve feedback: ${error.message}`);
  }
};

const leaveFeedback = async () => {
  const membersQuery =
    "SELECT memberId, CONCAT(firstName, ' ', lastName) AS memberName FROM members ORDER BY firstName, lastName ASC";
  const trainersQuery =
    "SELECT trainerId, CONCAT(firstName, ' ', lastName) AS trainerName FROM trainers ORDER BY firstName, lastName ASC";

  const [membersResult, trainersResult] = await Promise.all([
    query(membersQuery),
    query(trainersQuery),
  ]);

  const memberChoices = membersResult.rows.map((member) => ({
    name: member.membername,
    value: member.memberid,
  }));
  const trainerChoices = trainersResult.rows.map((trainer) => ({
    name: trainer.trainername,
    value: trainer.trainerid,
  }));

  const answers = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "Select your name:",
      choices: memberChoices,
    },
    {
      name: "trainerId",
      type: "list",
      message: "Select a Trainer:",
      choices: trainerChoices,
    },
    { name: "feedbackText", type: "input", message: "Your Feedback:" },
    { name: "rating", type: "input", message: "Rating (1-5):" },
  ]);

  const queryText = `
    INSERT INTO feedback (memberId, trainerId, feedbackText, rating, date)
    VALUES ($1, $2, $3, $4, NOW()) RETURNING feedbackId
  `;
  try {
    const { rows } = await query(queryText, [
      answers.memberId,
      answers.trainerId,
      answers.feedbackText,
      answers.rating,
    ]);
    console.log(
      `Feedback submitted successfully with Feedback ID: ${rows[0].feedbackId}`
    );
  } catch (error) {
    console.error(`Failed to submit feedback: ${error.message}`);
  }
};

const memberMenu = async () => {
  const action = await inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "Choose an action:",
      choices: [
        "Register",
        "Update Profile",
        "View Dashboard",
        "View Scheduled Session",
        "Schedule Session",
        "Cancel Session",
        "View Nutrition Logs",
        "Log Nutrition",
        "View Feedback",
        "Leave Feedback",
        "Exit",
      ],
    },
  ]);

  switch (action.action) {
    case "Register":
      await registerMember();
      break;
    case "Update Profile":
      await updateProfile();
      break;
    case "View Dashboard":
      await viewDashboard();
      break;
    case "View Scheduled Session":
      await viewScheduleSession();
      break;
    case "Schedule Session":
      await scheduleSession();
      break;
    case "Cancel Session":
      await cancelSession();
      break;
    case "View Nutrition Logs":
      await viewNutrition();
      break;
    case "Log Nutrition":
      await logNutrition();
      break;
    case "View Feedback":
      await viewFeedback();
      break;
    case "Leave Feedback":
      await leaveFeedback();
      break;
    case "Exit":
      console.log("Exiting Member Menu...");
      return;
  }
  await memberMenu();
};

export default memberMenu;
