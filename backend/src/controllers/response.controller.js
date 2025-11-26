import axios from "axios";
import Form from "../models/Form.js";
import Response from "../models/Response.js";
import User from "../models/User.js";
import { Parser } from "json2csv";

/* ============================================
   ✅ SUBMIT FORM RESPONSE
   POST /api/responses
============================================ */
export const submitResponse = async (req, res) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ error: "Missing formId or answers" });
    }

    // 1️⃣ Load form
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // 2️⃣ TEMP: Get latest authenticated user
    const user = await User.findOne().sort({ createdAt: -1 });

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // 3️⃣ Validate answers against form definition
    for (const q of form.questions) {
      const value = answers[q.questionKey];

      if (q.required && (value === undefined || value === null || value === "")) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${q.label}` });
      }

      // Additional type safety checks
      if (q.type === "multipleSelects" && value && !Array.isArray(value)) {
        return res
          .status(400)
          .json({ error: `${q.label} must be an array` });
      }
    }

    // 4️⃣ Map answers to Airtable field IDs
    const airtableFields = {};

    for (const q of form.questions) {
      if (answers[q.questionKey] !== undefined) {
        airtableFields[q.airtableFieldId] = answers[q.questionKey];
      }
    }

    // 5️⃣ Push record to Airtable
    const airtableResponse = await axios.post(
      `${process.env.AIRTABLE_API_BASE_URL}/${form.airtableBaseId}/${encodeURIComponent(
        form.airtableTableId
      )}`,
      {
        fields: airtableFields,
      },
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const airtableRecordId = airtableResponse.data.id;

    // 6️⃣ Save in MongoDB
    const responseDoc = await Response.create({
      formId,
      airtableRecordId,
      answers,
    });

    res.status(201).json({
      message: "Response submitted successfully",
      response: responseDoc,
    });
  } catch (error) {
    console.error(
      "Submit Response Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to submit response" });
  }
};

/* ============================================
   ✅ GET ALL RESPONSES FOR A FORM
   GET /api/forms/:formId/responses
============================================ */
export const getResponsesByForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await Response.find({ formId })
      .sort({ createdAt: -1 }); // newest first

    const formatted = responses.map((r) => ({
      submissionId: r._id,
      createdAt: r.createdAt,
      status: r.status,
      answersPreview: Object.entries(r.answers).slice(0, 3), // compact preview
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get Responses Error:", error.message);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
};



/* ============================================
   ✅ EXPORT RESPONSES (CSV / JSON)
   GET /api/forms/:formId/responses/export
   ?format=csv | json
============================================ */
export const exportResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const format = req.query.format || "json";

    const responses = await Response.find({ formId });

    if (format === "csv") {
      const flatData = responses.map((r) => ({
        submissionId: r._id.toString(),
        status: r.status,
        createdAt: r.createdAt,
        ...r.answers,
      }));

      const parser = new Parser();
      const csv = parser.parse(flatData);

      res.header("Content-Type", "text/csv");
      res.attachment("responses.csv");
      return res.send(csv);
    }

    res.json(responses);
  } catch (error) {
    console.error("Export Error:", error.message);
    res.status(500).json({ error: "Failed to export responses" });
  }
};


