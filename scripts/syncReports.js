// scripts/syncReports.js
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// 🟢 Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🟡 Google setup
const SHEET_ID = "11m_Nq6IT3Mo5bmLMUIM51aBt--vv7T50v94iPxplfC4";
const credentialsPath = "./credentials.json";

if (!fs.existsSync(credentialsPath)) {
  console.error("❌ Missing credentials.json file!");
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath));
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
const sheets = google.sheets({ version: "v4", auth });

// 🧠 Helper function to append rows
async function appendToSheet(data) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            data.id,
            data.driver_name,
            data.truck_number,
            data.material_type,
            data.delivery_from,
            data.delivery_to,
            data.mileage,
            data.allowance,
            data.fuel_per_day,
            data.remarks,
            data.created_at,
          ],
        ],
      },
    });

    console.log(`✅ Added new report for ${data.driver_name} → ${response.statusText || "OK"}`);
  } catch (err) {
    console.error("❌ Error appending to Google Sheet:", err.message);
  }
}

// 🚀 Start Supabase realtime listener
async function startSync() {
  console.log("🚀 Connecting to Supabase realtime for 'reports'...");

  supabase
    .channel("reports-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "reports" },
      async (payload) => {
        console.log("🆕 New report received:", payload.new);
        await appendToSheet(payload.new);
      }
    )
    .subscribe((status) => {
      console.log("📡 Channel status:", status);
    });
}

startSync();
