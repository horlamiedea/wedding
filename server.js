const express = require("express");
const sgMail = require("@sendgrid/mail");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4173;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

app.post("/api/rsvp", async (req, res) => {
  try {
    const { name, attending, plusOne, plusOneName } = req.body;

    if (!name || !name.trim()) {
      return res.json({ success: false, message: "Please enter your name." });
    }
    if (attending === null || attending === undefined) {
      return res.json({
        success: false,
        message: "Please select whether you will attend.",
      });
    }

    const attendingText = attending ? "Joyfully Accepts" : "Regretfully Declines";
    const plusOneText = plusOne
      ? `Yes — ${plusOneName || "Guest"}`
      : "No";

    const msg = {
      to: "preciousosara@gmail.com",
      from: { email: "noreply@mycastellum.com", name: "Wedding Guest" },
      subject: `RSVP from ${name.trim()} — ${attendingText}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #faf9f6; border: 1px solid #e8e0d0;">
          <h2 style="color: #2c2c2c; font-weight: 300; border-bottom: 1px solid #d4af37; padding-bottom: 12px;">
            New RSVP Received
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Guest Name</td>
              <td style="padding: 10px 0; color: #2c2c2c; font-size: 16px;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Attending</td>
              <td style="padding: 10px 0; color: ${attending ? "#2e7d32" : "#c62828"}; font-size: 16px; font-weight: 600;">${attendingText}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Plus One</td>
              <td style="padding: 10px 0; color: #2c2c2c; font-size: 16px;">${plusOneText}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; color: #aaa; font-size: 12px; font-style: italic;">
            #deefoundhisprecious — May 30, 2026
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return res.json({
      success: true,
      message: `Thank you, ${name.trim()}! Your RSVP has been received.`,
    });
  } catch (error) {
    const body = error?.response?.body;
    console.error("RSVP error:", body || error.message);

    let message = "Something went wrong. Please try again.";
    if (body?.errors?.[0]?.message?.includes("authorization")) {
      message = "Email service configuration error. Please contact the couple directly.";
    }

    return res.json({ success: false, message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Wedding site running at http://localhost:${PORT}`);
});
