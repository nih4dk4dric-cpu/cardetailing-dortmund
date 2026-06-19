var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_vite = require("vite");
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
var BOOKINGS_FILE = import_path.default.join(process.cwd(), "bookings.json");
app.use(import_express.default.json());
var getServiceName = (id) => {
  const serviceMap = {
    "basic-clean": "Basic-Reinigung",
    "premium-clean": "Premium-Aufbereitung",
    "interior-detail": "Innenraum-Intensivpflege",
    "paint-polish": "Lack-Korrektur & Politur",
    "coating": "Keramikversiegelung",
    "engine-detail": "Motorraumaufbereitung",
    "individual": "Individuelle Beratung / Sonderwunsch"
  };
  return serviceMap[id] || id;
};
async function initBookingsFile() {
  try {
    await import_promises.default.access(BOOKINGS_FILE);
  } catch {
    await import_promises.default.writeFile(BOOKINGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}
async function readBookings() {
  await initBookingsFile();
  try {
    const data = await import_promises.default.readFile(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading bookings file:", err);
    return [];
  }
}
async function writeBookings(bookings) {
  try {
    await import_promises.default.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing bookings file:", err);
    return false;
  }
}
async function sendBookingEmail(booking, isCancellation = false) {
  const provider = process.env.EMAIL_PROVIDER || "console";
  const fromEmail = process.env.EMAIL_FROM || "no-reply@cardetailing-dortmund.de";
  const operatorEmail = process.env.EMAIL_OPERATOR || "cardetailing.do@gmail.com";
  const readableDate = new Date(booking.date).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const serviceName = getServiceName(booking.serviceId);
  const operatorHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0A; padding: 40px 15px; color: #E5E7EB;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #121212; border: 2px solid #FF6B00; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Header Banner -->
        <div style="background-color: #000000; padding: 30px; text-align: center; border-bottom: 1px solid #1F2937;">
          <h1 style="color: #FF6B00; margin: 0; font-size: 28px; letter-spacing: 1px; text-transform: uppercase; font-weight: 900;">
            CDD CarDetailing
          </h1>
          <p style="color: #9CA3AF; margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">
            ${isCancellation ? "Terminstornierung" : "Neue Terminanfrage"}
          </p>
        </div>

        <!-- Content Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #FFFFFF; font-size: 20px; font-weight: bold; margin-top: 0; border-left: 4px solid #FF6B00; padding-left: 15px;">
            HAllo Team,
          </h2>
          <p style="color: #D1D5DB; font-size: 15px; line-height: 1.6;">
            ${isCancellation ? `Die untenstehende Terminanfrage wurde soeben erfolgreich <strong>storniert</strong>. Der Kalenderslot f\xFCr diesen Tag ist somit wieder freigegeben.` : `Eine neue unverbindliche Terminanfrage ist \xFCber die Website eingegangen.`}
          </p>

          <!-- Highlight Box -->
          <div style="background-color: #1A1A1A; border: 1px solid #2D2D2D; border-radius: 16px; padding: 25px; margin: 30px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; width: 150px; text-transform: uppercase;">Buchungs-ID:</td>
                <td style="padding: 8px 0; color: #FF6B00; font-weight: bold;">${booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; text-transform: uppercase;">Name:</td>
                <td style="padding: 8px 0; color: #FFFFFF; font-weight: bold;">${booking.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; text-transform: uppercase;">Dienstleistung:</td>
                <td style="padding: 8px 0; color: #FF6B00; font-weight: bold;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; text-transform: uppercase;">Wunschtermin:</td>
                <td style="padding: 8px 0; color: #FFFFFF;">${readableDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; text-transform: uppercase;">Telefonnummer:</td>
                <td style="padding: 8px 0; color: #FFFFFF;"><a href="tel:${booking.phone}" style="color: #38BDF8; text-decoration: none;">${booking.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; text-transform: uppercase;">E-Mail:</td>
                <td style="padding: 8px 0; color: #FFFFFF;"><a href="mailto:${booking.email}" style="color: #38BDF8; text-decoration: none;">${booking.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; text-transform: uppercase;">Einsatzort (Mobil):</td>
                <td style="padding: 8px 0; color: #FFFFFF;">${booking.location || "Nicht angegeben/Vor Ort"}</td>
              </tr>
              ${booking.message ? `
              <tr>
                <td style="padding: 8px 0; color: #888888; font-weight: bold; vertical-align: top; text-transform: uppercase;">Nachricht:</td>
                <td style="padding: 8px 0; color: #D1D5DB; line-height: 1.5; white-space: pre-wrap;">${booking.message}</td>
              </tr>
              ` : ""}
            </table>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${booking.email}?subject=AW: Ihrer Terminanfrage ${booking.id}" style="background-color: #FF6B00; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 25px; border-radius: 10px; display: inline-block; transition: all 0.2s;">
              Diesen Kunden jetzt kontaktieren
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #000000; padding: 20px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #1F2937;">
          Diese E-Mail wurde automatisch vom Buchungssystem der CarDetailing Dortmund Website erzeugt.
        </div>
      </div>
    </div>
  `;
  const customerHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0A; padding: 40px 15px; color: #E5E7EB;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #121212; border: 2px solid #FF6B00; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Header Banner -->
        <div style="background-color: #000000; padding: 30px; text-align: center; border-bottom: 1px solid #1F2937;">
          <h1 style="color: #FF6B00; margin: 0; font-size: 28px; letter-spacing: 1px; text-transform: uppercase; font-weight: 900;">
            CDD CarDetailing
          </h1>
          <p style="color: #9CA3AF; margin: 5px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
            ${isCancellation ? "Ihre Stornierungbest\xE4tigung" : "Ihre Terminanfrage ist eingegangen!"}
          </p>
        </div>

        <!-- Content Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #FFFFFF; font-size: 20px; font-weight: bold; margin-top: 0;">
            Hallo ${booking.name},
          </h2>
          <p style="color: #D1D5DB; font-size: 15px; line-height: 1.6;">
            ${isCancellation ? `Hiermit best\xE4tigen wir Ihnen die Stornierung Ihrer Terminanfrage mit der ID <strong>${booking.id}</strong>. Der gew\xFCnschte Termin am ${readableDate} wurde freigegeben.` : `Vielen Dank f\xFCr Ihr Vertrauen bei CarDetailing Dortmund! Wir haben Ihre unverbindliche Terminanfrage erfolgreich registriert.`}
          </p>
          
          ${!isCancellation ? `
          <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            Wir pr\xFCfen unsere freien Kapazit\xE4ten f\xFCr Ihren Wunschtermin am <strong>${readableDate}</strong>. Einer unserer Experten wird sich innerhalb der n\xE4chsten <strong>2 Stunden</strong> telefonisch oder per E-Mail bei Ihnen melden, um den Termin final zu besprechen und zu best\xE4tigen.
          </p>
          ` : ""}

          <!-- Details Box -->
          <div style="background-color: #1A1A1A; border: 1px solid #2D2D2D; border-radius: 16px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #FFFFFF; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 15px 0; border-bottom: 1px solid #2D2D2D; padding-bottom: 8px;">
              Zusammenfassung der Anfrage:
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
              <tr>
                <td style="padding: 6px 0; color: #888888; font-weight: bold; width: 150px;">Buchungsnummer:</td>
                <td style="padding: 6px 0; color: #FF6B00; font-weight: bold;">${booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888888; font-weight: bold;">Gew\xE4hlte Leistung:</td>
                <td style="padding: 6px 0; color: #FFFFFF; font-weight: bold;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888888; font-weight: bold;">Gew\xFCnschtes Datum:</td>
                <td style="padding: 6px 0; color: #FFFFFF;">${readableDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888888; font-weight: bold;">Fahrzeug:</td>
                <td style="padding: 6px 0; color: #FFFFFF;">${booking.carModel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888888; font-weight: bold;">Einsatzort (Mobil):</td>
                <td style="padding: 6px 0; color: #FFFFFF;">${booking.location || "Nicht angegeben/Vor Ort"}</td>
              </tr>
            </table>
          </div>

          <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">
            Sollten Sie Fragen oder \xC4nderungsw\xFCnsche zu Ihrer Anfrage haben, antworten Sie einfach direkt auf diese E-Mail oder rufen Sie uns unter <a href="tel:+4917630542371" style="color: #FF6B00; text-decoration: none; font-weight: bold;">+49 176 30542371</a> an.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #000000; padding: 25px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #1F2937;">
          <strong>CarDetailing Dortmund CDD</strong><br>
          Professionelle Autoreinigung & Aufbereitung vor Ort<br>
          Dortmund & Umgebung \u2022 Mobilservice direkt bei Ihnen
        </div>
      </div>
    </div>
  `;
  const subjectOperator = isCancellation ? `\u274C Stornierung: CDD Terminanfrage ${booking.id}` : `\u{1F697} Neue CDD Terminanfrage: ${booking.id} (${booking.name})`;
  const subjectCustomer = isCancellation ? `Stornierungsbest\xE4tigung: Ihre CDD Terminanfrage ${booking.id}` : `Best\xE4tigung: Ihre CDD Terminanfrage ${booking.id} ist eingegangen`;
  console.log("======================================= EMAIL LOG =======================================");
  console.log(`[EMAIL PROVIDER: ${provider.toUpperCase()}]`);
  console.log("---------------------------- SENDER -> OPERATOR EMAIL ----------------------------");
  console.log(`FROM: ${fromEmail}`);
  console.log(`TO: ${operatorEmail}`);
  console.log(`SUBJECT: ${subjectOperator}`);
  console.log("---------------------------- SENDER -> CLIENT EMAIL ----------------------------");
  console.log(`FROM: ${fromEmail}`);
  console.log(`TO: ${booking.email}`);
  console.log(`SUBJECT: ${subjectCustomer}`);
  console.log("==========================================================================================");
  if (provider === "smtp" && process.env.SMTP_HOST) {
    try {
      console.log(`Initializing custom SMTP transport connecting to ${process.env.SMTP_HOST}...`);
      const transporter = import_nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || ""
        } : void 0
      });
      await transporter.sendMail({
        from: `"${booking.name} via CDD" <${fromEmail}>`,
        replyTo: booking.email,
        to: operatorEmail,
        subject: subjectOperator,
        html: operatorHtml
      });
      console.log(`SMTP notification successfully sent to Operator email: ${operatorEmail}`);
      if (booking.email) {
        await transporter.sendMail({
          from: `"CarDetailing Dortmund" <${fromEmail}>`,
          to: booking.email,
          subject: subjectCustomer,
          html: customerHtml
        });
        console.log(`SMTP confirmation successfully sent to Customer email: ${booking.email}`);
      }
    } catch (err) {
      console.error("Failed to send emails via SMTP transporter.", err);
    }
  } else if (provider === "resend" && process.env.RESEND_API_KEY) {
    try {
      console.log("Sending emails via Resend REST API...");
      const opRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `CarDetailing Dortmund <${fromEmail}>`,
          to: [operatorEmail],
          reply_to: booking.email,
          subject: subjectOperator,
          html: operatorHtml
        })
      });
      if (opRes.ok) {
        console.log("Resend API: Notification successfully sent to operator.");
      } else {
        const errorText = await opRes.text();
        console.error("Resend API Error (Operator Mail):", errorText);
      }
      if (booking.email) {
        const custRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: `CarDetailing Dortmund <${fromEmail}>`,
            to: [booking.email],
            subject: subjectCustomer,
            html: customerHtml
          })
        });
        if (custRes.ok) {
          console.log("Resend API: Confirmation successfully sent to Customer.");
        } else {
          const errorText = await custRes.text();
          console.error("Resend API Error (Customer Mail):", errorText);
        }
      }
    } catch (err) {
      console.error("Failed to send emails via Resend REST API:", err);
    }
  } else {
    console.log("No custom email keys are active in .env. Interactive booking successfully processed/logged.");
  }
}
app.get("/api/bookings/reserved-dates", async (req, res) => {
  const bookings = await readBookings();
  const dates = bookings.map((b) => b.date);
  res.json({ success: true, reservedDates: dates });
});
app.post("/api/bookings", async (req, res) => {
  try {
    const { name, phone, email, carModel, serviceId, date, location, message } = req.body;
    if (!name || !phone || !email || !carModel || !serviceId || !date) {
      return res.status(400).json({
        success: false,
        error: "Fehlende Pflichtfelder. Bitte f\xFCllen Sie das Formular vollst\xE4ndig aus."
      });
    }
    const bookings = await readBookings();
    const isDoubleBooked = bookings.some((b) => b.date === date);
    if (isDoubleBooked) {
      return res.status(400).json({
        success: false,
        error: "Dieser Wunschtermin ist leider bereits vergeben. Bitte w\xE4hlen Sie ein anderes Datum."
      });
    }
    const shortId = `CDD-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const newBooking = {
      id: shortId,
      name,
      phone,
      email,
      carModel,
      serviceId,
      date,
      location,
      message,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    bookings.push(newBooking);
    await writeBookings(bookings);
    sendBookingEmail(newBooking).catch((err) => {
      console.error("Asynchronous email trigger failed:", err);
    });
    res.status(201).json({
      success: true,
      booking: newBooking
    });
  } catch (err) {
    console.error("Server API Booking error:", err);
    res.status(500).json({
      success: false,
      error: "Interner Serverfehler aufgetreten. Bitte versuchen Sie es erneut."
    });
  }
});
app.post("/api/bookings/cancel", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Buchungs-ID ist erforderlich zum Stornieren."
      });
    }
    const bookings = await readBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Es wurde keine aktive Terminanfrage unter der ID ${id} gefunden.`
      });
    }
    const cancelledBooking = bookings[index];
    bookings.splice(index, 1);
    await writeBookings(bookings);
    sendBookingEmail(cancelledBooking, true).catch((err) => {
      console.error("Asynchronous cancellation email trigger failed:", err);
    });
    console.log(`Booking ${id} was successfully canceled on the server. Calendar date ${cancelledBooking.date} is freed up.`);
    res.json({
      success: true,
      message: `Die Terminanfrage ${id} wurde erfolgreich storniert.`
    });
  } catch (err) {
    console.error("Server API Cancellation error:", err);
    res.status(500).json({
      success: false,
      error: "Datenbankfehler beim Stornieren des Termins."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Delivering production assets from: " + distPath);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CDD Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Critical: Express-Vite backend failed to initialize.", err);
});
//# sourceMappingURL=server.cjs.map
