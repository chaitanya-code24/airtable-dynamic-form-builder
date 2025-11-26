import Response from "../models/Response.js";

/* ============================================
   ✅ AIRTABLE WEBHOOK HANDLER
   POST /webhooks/airtable
============================================ */
export const airtableWebhookHandler = async (req, res) => {
  try {
    const payload = req.body;

    /*
      Airtable sends different event types.
      We only care about:
      - record update
      - record delete
    */

    const events = payload?.events || [];

    for (const event of events) {
      const recordId = event?.recordId;
      const action = event?.type;

      if (!recordId || !action) continue;

      // ✅ Record Updated
      if (action === "update") {
        await Response.findOneAndUpdate(
          { airtableRecordId: recordId },
          {
            updatedAt: new Date(),
          }
        );
      }

      // ✅ Record Deleted
      if (action === "delete") {
        await Response.findOneAndUpdate(
          { airtableRecordId: recordId },
          {
            status: "deletedInAirtable",
            updatedAt: new Date(),
          }
        );
      }
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
