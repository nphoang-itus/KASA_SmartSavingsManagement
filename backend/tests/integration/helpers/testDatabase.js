import { supabase } from "../../../src/config/database.js";
import bcrypt from "bcrypt";

export async function cleanDatabase() {
  try {
    await supabase.from("transaction").delete().neq("transactionid", null);
    await supabase.from("savingbook").delete().neq("bookid", null);
    await supabase.from("customer").delete().neq("customerid", null);
    await supabase.from("useraccount").delete().neq("userid", null);
    await supabase.from("employee").delete().neq("employeeid", null);

    // Kiểm tra lại số lượng customer còn lại
    const { count } = await supabase
      .from("customer")
      .select("*", { count: "exact", head: true });
    console.log("Customer count after clean:", count);

    console.log("Database cleaned");
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  }
}

export async function seedTestData() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const tellerPassword = await bcrypt.hash("teller123", 10);
    const accountantPassword = await bcrypt.hash("accountant123", 10);

    // 1. Create test branches
    const { data: branches, error: branchError } = await supabase
      .from("branch")
      .insert([
        { branchname: "Test Branch 1" },
        { branchname: "Test Branch 2" },
      ])
      .select();
    if (branchError) console.error("Branch insert error:", branchError);

    // 2. Create test roles
    const { data: roles, error: roleError } = await supabase
      .from("role")
      .select("*");
    if (roleError) console.error("Role select error:", roleError);

    // 3. Upsert test employees (không insert nếu đã tồn tại)
    const employeesToSeed = [
      {
        employeeid: 1001,
        fullname: "Test Admin",
        email: "admin@test.com",
        roleid: roles.find((r) => r.rolename === "Admin")?.roleid,
        branchid: branches[0].branchid,
      },
      {
        employeeid: 1002,
        fullname: "Test Teller",
        email: "teller@test.com",
        roleid: roles.find((r) => r.rolename === "Teller")?.roleid,
        branchid: branches[0].branchid,
      },
      {
        employeeid: 1003,
        fullname: "Test Accountant",
        email: "accountant@test.com",
        roleid: roles.find((r) => r.rolename === "Accountant")?.roleid,
        branchid: branches[0].branchid,
      },
    ];

    for (const emp of employeesToSeed) {
      const { error } = await supabase
        .from("employee")
        .upsert(emp, { onConflict: "employeeid" });
      if (error) console.error("Employee upsert error:", error);
    }

    // 4. Update password cho useraccount vừa được trigger tạo ra
    await supabase
      .from("useraccount")
      .update({ password: adminPassword, accountstatus: "Active" })
      .eq("userid", 1001);
    await supabase
      .from("useraccount")
      .update({ password: tellerPassword, accountstatus: "Active" })
      .eq("userid", 1002);
    await supabase
      .from("useraccount")
      .update({ password: accountantPassword, accountstatus: "Active" })
      .eq("userid", 1003);

    // 5. KHÔNG seed customer ở đây nữa!
    // const { data: customers } = await supabase
    //   .from("customer")
    //   .insert([
    //     {
    //       fullname: "Test Customer 1",
    //       citizenid: "001234567890",
    //       street: "Test Street 1",
    //       district: "Test District 1",
    //       province: "HCM",
    //     },
    //     {
    //       fullname: "Test Customer 2",
    //       citizenid: "001234567891",
    //       street: "Test Street 2",
    //       district: "Test District 2",
    //       province: "HCM",
    //     },
    //   ])
    //   .select();

    // 6. Get type savings
    const { data: typeSavings } = await supabase
      .from("typesaving")
      .select("*")
      .limit(2);

    console.log("✅ Test data seeded");

    return {
      branches,
      roles,
      typeSavings,
    };
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    throw error;
  }
}

/**
 * Get test user token
 */
export async function getTestUserToken(username) {
  const { data, error } = await supabase
    .from("employee")
    .select(
      `
      *,
      useraccount!inner(*),
      role(*)
    `
    )
    .eq("email", username) // <-- Sửa lại join theo email
    .single();

  if (error || !data) {
    throw new Error(`User ${username} not found`);
  }

  // In real scenario, you would call the login endpoint
  // For testing, we can generate token directly
  const jwt = await import("jsonwebtoken");
  const token = jwt.default.sign(
    {
      userId: data.employeeid,
      userName: data.fullname, // hoặc data.email
      roleName: data.role.rolename, // phải là "Teller" (chữ hoa đầu)
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
}

/**
 * Create test saving book
 */
export async function createTestSavingBook(
  customerId,
  typeId,
  balance = 1000000
) {
  const { data, error } = await supabase
    .from("savingbook")
    .insert({
      customerid: customerId,
      typeid: typeId,
      currentbalance: balance,
      status: "Open",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create test transaction
 */
export async function createTestTransaction(
  bookId,
  amount,
  type = "Deposit",
  tellerId = "TEST_EMP002"
) {
  const { data, error } = await supabase
    .from("transaction")
    .insert({
      bookid: bookId,
      amount: amount,
      transactiontype: type,
      tellerid: tellerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
