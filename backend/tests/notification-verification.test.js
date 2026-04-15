/**
 * Notification Verification Test Script
 *
 * Tests that notifications are correctly created for the following events:
 *   1. workspace_invite  – when a user is invited to a workspace
 *   2. project_added     – when a new project is created in a workspace
 *   3. task_assigned     – when a task is assigned to a user (create & update)
 *   4. task_completed    – when a task is marked as Done
 *
 * Also tests:
 *   - Mark single notification as read
 *   - Mark all notifications as read
 *
 * Prerequisites:
 *   - MongoDB running locally on port 27017
 *   - Backend server running on port 3001
 *
 * Usage:
 *   node backend/tests/notification-verification.test.js
 */

const BASE = "http://localhost:3001/api-v1";

async function api(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function run() {
  console.log("=== Notification Verification Tests ===\n");

  // ------------------------------------------------------------------
  // Setup: create two users directly via the register endpoint won't
  // work without SendGrid. Instead we rely on pre-seeded users or
  // create them via mongoose. For CI we use the API with a helper that
  // seeds users. Here we just login with existing test accounts.
  // ------------------------------------------------------------------

  // Use dynamic import so this file can live inside the ESM backend
  const mongoose = (await import("mongoose")).default;
  const bcrypt = (await import("bcrypt")).default;

  await mongoose.connect("mongodb://localhost:27017/tasco");

  // Clean previous test notification users (avoid conflicts)
  await mongoose.connection.db.collection("users").deleteMany({
    email: { $in: ["notif-admin@test.com", "notif-member@test.com"] },
  });

  const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isEmailVerified: { type: Boolean, default: false },
    profilePicture: String,
    lastLogin: Date,
    xp: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
  });
  const User = mongoose.model("User", UserSchema);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash("12345678", salt);

  const admin = await User.create({
    name: "Admin User",
    email: "notif-admin@test.com",
    password: hash,
    isEmailVerified: true,
  });
  const member = await User.create({
    name: "Member User",
    email: "notif-member@test.com",
    password: hash,
    isEmailVerified: true,
  });

  await mongoose.disconnect();

  // Login both users
  const adminLogin = await api("POST", "/auth/login", {
    email: "notif-admin@test.com",
    password: "12345678",
  });
  const memberLogin = await api("POST", "/auth/login", {
    email: "notif-member@test.com",
    password: "12345678",
  });

  const adminToken = adminLogin.token;
  const memberToken = memberLogin.token;
  const adminId = adminLogin.user._id;
  const memberId = memberLogin.user._id;

  assert(!!adminToken, "Admin login succeeds");
  assert(!!memberToken, "Member login succeeds");

  // ------------------------------------------------------------------
  // 1. Create workspace
  // ------------------------------------------------------------------
  console.log("\n--- Workspace Creation ---");
  const ws = await api(
    "POST",
    "/workspaces",
    { name: "Notif Test WS", description: "Testing", color: "#3b82f6" },
    adminToken
  );
  assert(ws._id, "Workspace created");

  // ------------------------------------------------------------------
  // 2. Invite member → workspace_invite notification
  // ------------------------------------------------------------------
  console.log("\n--- Workspace Invite Notification ---");
  const inviteRes = await api(
    "POST",
    `/workspaces/${ws._id}/invite-member`,
    { email: "notif-member@test.com", role: "member" },
    adminToken
  );
  assert(inviteRes.message === "Invitation sent successfully", "Invite sent");

  // Small delay for async notification creation
  await new Promise((r) => setTimeout(r, 500));

  let notifs = await api("GET", "/notifications", null, memberToken);
  const inviteNotif = notifs.find((n) => n.type === "workspace_invite");
  assert(!!inviteNotif, "workspace_invite notification exists");
  assert(
    inviteNotif?.message?.includes("Notif Test WS"),
    "workspace_invite message contains workspace name"
  );
  assert(inviteNotif?.isRead === false, "workspace_invite is unread");

  // ------------------------------------------------------------------
  // 3. Member joins workspace
  // ------------------------------------------------------------------
  console.log("\n--- Member Joins Workspace ---");
  const acceptRes = await api(
    "POST",
    `/workspaces/${ws._id}/accept-generate-invite`,
    null,
    memberToken
  );
  assert(
    acceptRes.message === "Invitation accepted successfully",
    "Member joined workspace"
  );

  // ------------------------------------------------------------------
  // 4. Create project → project_added notification
  // ------------------------------------------------------------------
  console.log("\n--- Project Added Notification ---");
  const project = await api(
    "POST",
    `/projects/${ws._id}/create-project`,
    {
      title: "Notif Test Project",
      description: "A project",
      status: "In Progress",
      startDate: "2026-04-15",
      members: [
        { user: adminId, role: "manager" },
        { user: memberId, role: "contributor" },
      ],
    },
    adminToken
  );
  assert(project._id, "Project created");

  await new Promise((r) => setTimeout(r, 500));

  notifs = await api("GET", "/notifications", null, memberToken);
  const projectNotif = notifs.find((n) => n.type === "project_added");
  assert(!!projectNotif, "project_added notification exists");
  assert(
    projectNotif?.message?.includes("Notif Test Project"),
    "project_added message contains project name"
  );

  // ------------------------------------------------------------------
  // 5. Create task with assignee → task_assigned notification
  // ------------------------------------------------------------------
  console.log("\n--- Task Assigned Notification (on create) ---");
  const task = await api(
    "POST",
    `/tasks/${project._id}/create-task`,
    {
      title: "Notif Test Task",
      description: "Do something",
      status: "To Do",
      priority: "High",
      dueDate: "2026-04-30",
      assignees: [memberId],
    },
    adminToken
  );
  assert(task._id, "Task created");

  await new Promise((r) => setTimeout(r, 500));

  notifs = await api("GET", "/notifications", null, memberToken);
  const assignNotif = notifs.find((n) => n.type === "task_assigned");
  assert(!!assignNotif, "task_assigned notification exists");
  assert(
    assignNotif?.message?.includes("Notif Test Task"),
    "task_assigned message contains task name"
  );

  // ------------------------------------------------------------------
  // 6. Mark task as Done → task_completed notification
  // ------------------------------------------------------------------
  console.log("\n--- Task Completed Notification ---");
  await api(
    "PUT",
    `/tasks/${task._id}/status`,
    { status: "Done" },
    adminToken
  );

  await new Promise((r) => setTimeout(r, 500));

  notifs = await api("GET", "/notifications", null, memberToken);
  const completedNotif = notifs.find((n) => n.type === "task_completed");
  assert(!!completedNotif, "task_completed notification exists");
  assert(
    completedNotif?.message?.includes("Notif Test Task"),
    "task_completed message contains task name"
  );

  // ------------------------------------------------------------------
  // 7. Mark single notification as read
  // ------------------------------------------------------------------
  console.log("\n--- Mark Single Notification Read ---");
  const singleReadRes = await api(
    "PUT",
    `/notifications/${inviteNotif._id}/read`,
    {},
    memberToken
  );
  assert(
    singleReadRes.message === "Notification marked as read",
    "Single notification marked as read"
  );

  notifs = await api("GET", "/notifications", null, memberToken);
  const readNotif = notifs.find((n) => n._id === inviteNotif._id);
  assert(readNotif?.isRead === true, "Notification isRead is true");

  // ------------------------------------------------------------------
  // 8. Mark all notifications as read
  // ------------------------------------------------------------------
  console.log("\n--- Mark All Notifications Read ---");
  const allReadRes = await api(
    "PUT",
    "/notifications/read-all",
    {},
    memberToken
  );
  assert(
    allReadRes.message === "All notifications marked as read",
    "All notifications marked as read"
  );

  notifs = await api("GET", "/notifications", null, memberToken);
  const allRead = notifs.every((n) => n.isRead);
  assert(allRead, "All notifications are now read");

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log("\n========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("========================================");

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
