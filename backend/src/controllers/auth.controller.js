import axios from "axios";
import crypto from "crypto";
import qs from "qs";
import User from "../models/User.js";

// In-memory store for PKCE (OK for dev; use Redis in prod)
const pkceStore = new Map();

/* ============================================
   ✅ START OAUTH (WITH PKCE)
============================================ */
export const airtableLogin = async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");

    // 1. Generate PKCE verifier
    const codeVerifier = crypto.randomBytes(32).toString("hex");

    // 2. Generate PKCE challenge
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 3. Store verifier for callback
    pkceStore.set(state, codeVerifier);

    const scope = encodeURIComponent(
      "data.records:read data.records:write schema.bases:read user.email:read webhook:manage"
    );

    const redirectUri = encodeURIComponent(
      process.env.AIRTABLE_REDIRECT_URI
    );

    const authUrl =
      `${process.env.AIRTABLE_OAUTH_AUTHORIZE_URL}` +
      `?client_id=${process.env.AIRTABLE_CLIENT_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    res.redirect(authUrl);
  } catch (error) {
    console.error("OAuth Login Error:", error.message);
    res.status(500).json({ error: "Failed to start OAuth flow" });
  }
};

/* ============================================
   ✅ OAUTH CALLBACK (WITH PKCE + BASIC AUTH)
============================================ */
export const airtableCallback = async (req, res) => {
  console.log("CALLBACK QUERY:", req.query);

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res
        .status(400)
        .json({ error: "Authorization code or state missing" });
    }

    // 1. Retrieve code_verifier
    const codeVerifier = pkceStore.get(state);

    if (!codeVerifier) {
      return res
        .status(400)
        .json({ error: "Invalid or expired OAuth state" });
    }

    // Cleanup
    pkceStore.delete(state);

    // ✅ 2. BASIC AUTH HEADER (THIS WAS THE MISSING PART)
    const basicAuth = Buffer.from(
      `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
    ).toString("base64");

    // ✅ 3. Exchange code for tokens (FORM-ENCODED + BASIC AUTH)
    const tokenResponse = await axios.post(
      process.env.AIRTABLE_OAUTH_TOKEN_URL,
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // ✅ 4. Fetch Airtable user profile
    const profileResponse = await axios.get(
      "https://api.airtable.com/v0/meta/whoami",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const airtableUserId = profileResponse.data.id;
    const email = profileResponse.data.email;

    // ✅ 5. Save/update user in MongoDB
    await User.findOneAndUpdate(
      { airtableUserId },
      {
        airtableUserId,
        email,
        accessToken: access_token,
        refreshToken: refresh_token,
        loginAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // ✅ 6. Redirect to frontend dashboard
    res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    console.error("=== OAUTH CALLBACK ERROR FULL ===");
    console.error("Message:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Headers:", error.response?.headers);

    res.status(500).json({
      error: "OAuth callback failed",
      details: error.response?.data || error.message,
    });
  }
};
