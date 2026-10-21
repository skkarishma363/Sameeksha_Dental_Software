/**
 * Sameeksha Dental Software - Google Drive Refresh Token Generator
 * ================================================================
 * Generates a persistent OAuth 2.0 refresh token for Sameeksha's Google Drive backup.
 * 
 * Usage:
 *   node scripts/generate_google_refresh_token.mjs <CLIENT_ID> <CLIENT_SECRET>
 * 
 * Important Google Cloud Console Note:
 * - Go to Google Cloud Console -> APIs & Services -> OAuth consent screen
 * - Set Publishing status to "In Production" (click "Publish App").
 *   If left in "Testing" mode, Google automatically expires refresh tokens after 7 days!
 * - Authorized redirect URI: http://localhost:8085/oauth2callback
 *   (or http://127.0.0.1:8085/oauth2callback)
 */

import http from "node:http";
import https from "node:https";
import url from "node:url";

const clientId = process.argv[2] || process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.GOOGLE_DRIVE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Usage: node scripts/generate_google_refresh_token.mjs <CLIENT_ID> <CLIENT_SECRET>");
  console.error("Or set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET environment variables.");
  process.exit(1);
}

const REDIRECT_PORT = process.argv[4] ? Number(process.argv[4]) : (process.env.PORT ? Number(process.env.PORT) : 3000);
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`;
const SCOPES = ["https://www.googleapis.com/auth/drive.file"].join(" ");

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  }).toString();

console.log("==================================================================");
console.log(" Sameeksha Dental Software - Google Drive Authorization");
console.log("==================================================================");
console.log("\n1. Open the following URL in your web browser:\n");
console.log(authUrl);
console.log("\n2. Log in with Sameeksha's Google Account and grant Drive permissions.");
console.log(`3. Waiting for authorization response on ${REDIRECT_URI} ...\n`);

const server = http.createServer(async (req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === "/oauth2callback") {
    const code = reqUrl.query.code;
    const error = reqUrl.query.error;

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Authorization Failed</h1><p>${error}</p>`);
      console.error("Error from Google OAuth:", error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>No authorization code received.</h1>");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Authorization successful!</h1><p>You can close this tab and return to your terminal.</p>");
    server.close();

    console.log("Authorization code received. Exchanging for tokens...");

    const postData = new URLSearchParams({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString();

    const tokenReq = https.request(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (tokenRes) => {
        let body = "";
        tokenRes.on("data", (chunk) => (body += chunk));
        tokenRes.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (data.error) {
              console.error("Token exchange failed:", data.error, data.error_description);
              process.exit(1);
            }

            console.log("\n==================================================================");
            console.log(" SUCCESS! Refresh Token Generated Successfully");
            console.log("==================================================================");
            console.log("\nRefresh Token (save this to GitHub Secret GOOGLE_DRIVE_REFRESH_TOKEN):");
            console.log(`\n${data.refresh_token}\n`);
            console.log("==================================================================");
            console.log("IMPORTANT: Ensure OAuth Consent Screen in Google Cloud Console is");
            console.log("set to 'In Production' so this token does NOT expire after 7 days.");
            console.log("==================================================================");
          } catch (e) {
            console.error("Failed to parse token response:", e, body);
            process.exit(1);
          }
        });
      }
    );

    tokenReq.on("error", (e) => {
      console.error("Network error exchanging token:", e);
      process.exit(1);
    });

    tokenReq.write(postData);
    tokenReq.end();
  }
});

server.listen(REDIRECT_PORT);
