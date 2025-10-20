import { google } from "googleapis";
import fs from "fs";

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SHEET_ID = "11m_Nq6IT3Mo5bmLMUIM51aBt--vv7T50v94iPxplfC4";

async function testAppend() {
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["✅ Test Row from Script", new Date().toLocaleString()]],
      },
    });
    console.log("✅ Test row added!", res.statusText || res.status);
  } catch (err) {
    console.error("❌ Sheets error:", err.message);
  }
}

testAppend();
