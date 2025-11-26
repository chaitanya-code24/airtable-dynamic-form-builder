import axios from "axios";
import User from "../models/User.js";

/* ============================================
   ✅ GET USER BASES
   GET /api/airtable/bases
============================================ */
export const getBases = async (req, res) => {
  try {
    // ⚠️ TEMP: You don't have auth middleware yet,
    // so we just take the latest logged-in user
    const user = await User.findOne().sort({ createdAt: -1 });

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const response = await axios.get(
      "https://api.airtable.com/v0/meta/bases",
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    const bases = response.data.bases.map((base) => ({
      baseId: base.id,
      name: base.name,
    }));

    res.json(bases);
  } catch (error) {
    console.error("Get Bases Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch bases" });
  }
};

/* ============================================
   ✅ GET TABLES OF A BASE
   GET /api/airtable/bases/:baseId/tables
============================================ */
export const getTables = async (req, res) => {
  try {
    const { baseId } = req.params;

    const user = await User.findOne().sort({ createdAt: -1 });

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    const tables = response.data.tables.map((table) => ({
      tableId: table.id,
      name: table.name,
    }));

    res.json(tables);
  } catch (error) {
    console.error("Get Tables Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};

/* ============================================
   ✅ GET SUPPORTED FIELDS OF A TABLE
   GET /api/airtable/bases/:baseId/tables/:tableId/fields
============================================ */
export const getFields = async (req, res) => {
  try {
    const { baseId, tableId } = req.params;

    const user = await User.findOne().sort({ createdAt: -1 });

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    const table = response.data.tables.find(
      (t) => t.id === tableId
    );

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // ✅ Supported field types only
    const supportedTypes = [
      "singleLineText",
      "multilineText",
      "singleSelect",
      "multipleSelects",
      "multipleAttachments",
    ];

    const fields = table.fields
      .filter((field) => supportedTypes.includes(field.type))
      .map((field) => ({
        fieldId: field.id,
        name: field.name,
        type: field.type,
        options: field.options || null,
      }));

    res.json(fields);
  } catch (error) {
    console.error("Get Fields Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch fields" });
  }
};
