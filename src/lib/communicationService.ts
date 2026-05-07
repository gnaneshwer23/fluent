import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseInit";

/**
 * Communication Service (Simulated/Ready for Webhook/API)
 * Handles WhatsApp, Email and System-wide broadcasts.
 */

interface NotificationPayload {
  to: string; // Phone or Email
  type: 'whatsapp' | 'email';
  template: string;
  data: Record<string, any>;
}

export const triggerWhatsApp = async (phone: string, template: string, data: any) => {
  console.log(`[WhatsApp Trigger] To: ${phone}, Template: ${template}, Data:`, data);
  
  // Real integration pattern:
  /*
  const response = await fetch('YOUR_WHATSAPP_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_WHATSAPP_API_KEY}` },
    body: JSON.stringify({ to: phone, template, data })
  });
  */

  // Log to Firebase for audit
  await addDoc(collection(db, "notifications"), {
    recipient: phone,
    type: 'whatsapp',
    template,
    payload: data,
    status: 'dispatched',
    sentAt: serverTimestamp()
  });
};

export const notifyNewLead = (email: string) => {
  triggerWhatsApp('SYSTEM_ADMIN', 'new_lead_alert', { email });
};

export const notifyAlertTriggered = (studentId: string, alertType: string, message: string) => {
  // Logic to fetch user phone would go here
  triggerWhatsApp('STUDENT_PARENT_PHONE', 'intervention_alert', { alertType, message });
};
