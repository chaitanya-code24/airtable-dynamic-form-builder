import Form from "../models/Form.js";
import User from "../models/User.js";

/* ============================================
   ✅ CREATE FORM
   POST /api/forms
============================================ */
export const createForm = async (req, res) => {
  try {
    const { title, airtableBaseId, airtableTableId, questions } = req.body;

    if (!title || !airtableBaseId || !airtableTableId || !questions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // TEMP: latest logged-in user (until auth middleware)
    const user = await User.findOne().sort({ createdAt: -1 });

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ✅ Validate supported question types only
    const supportedTypes = [
      "singleLineText",
      "multilineText",
      "singleSelect",
      "multipleSelects",
      "multipleAttachments",
    ];

    for (const q of questions) {
      if (!supportedTypes.includes(q.type)) {
        return res
          .status(400)
          .json({ error: `Unsupported field type: ${q.type}` });
      }
    }

    const form = await Form.create({
      owner: user._id,
      title,
      airtableBaseId,
      airtableTableId,
      questions,
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Create Form Error:", error.message);
    res.status(500).json({ error: "Failed to create form" });
  }
};

/* ============================================
   ✅ GET FORM BY ID
   GET /api/forms/:formId
============================================ */
export const getFormById = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error("Get Form Error:", error.message);
    res.status(500).json({ error: "Failed to fetch form" });
  }
};

/* ============================================
   ✅ GET ALL FORMS (DASHBOARD)
   GET /api/forms
============================================ */
export const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });

    const formatted = forms.map((f) => ({
      formId: f._id,
      title: f.title,
      baseId: f.airtableBaseId,
      tableId: f.airtableTableId,
      createdAt: f.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get Forms Error:", error.message);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};
