import { Resend } from "resend";
import { env } from "./env";
import { escapeHtml } from "./escape-html";
import type { CustomItineraryDay } from "@/types/package-itinerary";

function getResend() {
  return new Resend(env.RESEND_API_KEY);
}

export async function sendInquiryEmail(content: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const html = `
    <h2>New Contact Message — Pitch to Paradise</h2>
    <p><b>Name:</b> ${escapeHtml(content.name)}</p>
    <p><b>Email:</b> ${escapeHtml(content.email)}</p>
    <p><b>Phone:</b> ${escapeHtml(content.phone)}</p>
    <p><b>Message:</b><br>${escapeHtml(content.message).replace(/\n/g, "<br>")}</p>
  `;

  const { error } = await getResend().emails.send({
    from: env.INQUIRY_FROM_EMAIL,
    to: env.INQUIRY_TO_EMAIL,
    replyTo: content.email,
    subject: `New contact message from ${content.name}`,
    html
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(error.message);
  }
}

export async function sendPackageInquiryEmail(content: {
  name: string;
  email: string;
  phone: string;
  teamName?: string;
  preferredPackage: string;
  opponentLevels: string[];
  cities: string[];
  hotelStars: number[];
  travelStart: string;
  generatedItinerary: CustomItineraryDay[];
  referenceHotelsShown: { city: string; name: string; stars: number }[];
  generationSource?: "llm" | "template";
  message: string;
}) {
  const itineraryRows = content.generatedItinerary
    .map(
      (day) =>
        `<tr>
          <td style="padding:6px;border:1px solid #ddd;">Day ${day.day}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(day.location)}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(day.activity)}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(day.hotelName)} (${day.hotelStars}★)</td>
        </tr>`
    )
    .join("");

  const referenceList = content.referenceHotelsShown
    .map((h) => `<li>${escapeHtml(h.name)} — ${escapeHtml(h.city)} (${h.stars}★)</li>`)
    .join("");

  const html = `
    <h2>New package inquiry — ${escapeHtml(content.preferredPackage)}</h2>
    <p><b>Name:</b> ${escapeHtml(content.name)}</p>
    <p><b>Email:</b> ${escapeHtml(content.email)}</p>
    <p><b>Phone:</b> ${escapeHtml(content.phone)}</p>
    ${content.teamName ? `<p><b>Team:</b> ${escapeHtml(content.teamName)}</p>` : ""}
    <h3>Preferences</h3>
    <ul>
      <li><b>Package:</b> ${escapeHtml(content.preferredPackage)}</li>
      <li><b>Opponent levels:</b> ${escapeHtml(content.opponentLevels.join(", "))}</li>
      <li><b>Cities:</b> ${escapeHtml(content.cities.join(", "))}</li>
      <li><b>Hotel standards:</b> ${content.hotelStars.join(", ")} stars</li>
      <li><b>Planning to visit:</b> ${escapeHtml(content.travelStart)}</li>
      ${content.generationSource ? `<li><b>Itinerary source:</b> ${content.generationSource === "llm" ? "AI-personalized" : "Template"}</li>` : ""}
    </ul>
    ${referenceList ? `<h3>Reference hotels shown</h3><ul>${referenceList}</ul>` : ""}
    <h3>Generated itinerary</h3>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="padding:6px;border:1px solid #ddd;text-align:left;">Day</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:left;">Location</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:left;">Activity</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:left;">Hotel</th>
        </tr>
      </thead>
      <tbody>${itineraryRows}</tbody>
    </table>
    <h3>Full message</h3>
    <pre style="white-space:pre-wrap;font-family:monospace;">${escapeHtml(content.message)}</pre>
  `;

  const { error } = await getResend().emails.send({
    from: env.INQUIRY_FROM_EMAIL,
    to: env.INQUIRY_TO_EMAIL,
    replyTo: content.email,
    subject: `New package inquiry — ${content.preferredPackage}`,
    html
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(error.message);
  }
}
