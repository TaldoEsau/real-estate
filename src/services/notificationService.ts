import { BookingRequest, NotificationRecord } from '../types';
import { StorageService } from './storageService';
import { generateUUID, formatDateString } from '../utils/formatters';
import { EmailDispatchService } from './emailDispatchService';

export const NotificationService = {
  async dispatchBookingNotifications(booking: BookingRequest): Promise<{
    clientNotification: NotificationRecord;
    agentNotification: NotificationRecord;
  }> {
    const property = StorageService.getPropertyById(booking.propertyId);
    const agent = StorageService.getAgentById(booking.agentId);
    const agentName = agent ? agent.name : 'Your Luxury Advisor';
    const agentEmail = agent ? agent.email : 'advisory@auraestates.com';

    const formattedDate = formatDateString(booking.date);
    const refCode = booking.id.slice(0, 8).toUpperCase();

    // 1. Client Confirmation Luxury HTML Email
    const clientHtml = EmailDispatchService.generateLuxuryHtmlEmail(booking);

    const clientRecord: NotificationRecord = {
      id: generateUUID(),
      bookingId: booking.id,
      recipientRole: 'client',
      recipientEmail: booking.clientEmail,
      subject: `AURA ESTATES: Viewing Confirmation (#${refCode})`,
      type: 'confirmation',
      contentHtml: clientHtml,
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };

    // 2. Agent Notification Alert
    const agentHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0B1323; color: #F3F4F6; border: 1px solid #4B5563; border-radius: 8px; padding: 24px;">
        <h2 style="color: #34D399; margin-top: 0;">New Viewing Request Scheduled</h2>
        <p>A new client has confirmed a viewing slot for your assigned property listing.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr><td style="padding: 6px; color: #9CA3AF;">Listing:</td><td style="padding: 6px; font-weight: bold;">${booking.propertyTitle}</td></tr>
          <tr><td style="padding: 6px; color: #9CA3AF;">Client Name:</td><td style="padding: 6px;">${booking.clientName}</td></tr>
          <tr><td style="padding: 6px; color: #9CA3AF;">Email:</td><td style="padding: 6px;">${booking.clientEmail}</td></tr>
          <tr><td style="padding: 6px; color: #9CA3AF;">Phone:</td><td style="padding: 6px;">${booking.clientPhone}</td></tr>
          <tr><td style="padding: 6px; color: #9CA3AF;">Appointment:</td><td style="padding: 6px; color: #DFCAAA;">${formattedDate} at ${booking.timeSlot}</td></tr>
          ${booking.notes ? `<tr><td style="padding: 6px; color: #9CA3AF;">Client Notes:</td><td style="padding: 6px;">${booking.notes}</td></tr>` : ''}
        </table>
      </div>
    `;

    const agentRecord: NotificationRecord = {
      id: generateUUID(),
      bookingId: booking.id,
      recipientRole: 'agent',
      recipientEmail: agentEmail,
      subject: `New Viewing Appointment: ${booking.clientName} - ${booking.propertyTitle}`,
      type: 'agent_alert',
      contentHtml: agentHtml,
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };

    await StorageService.addNotification(clientRecord);
    await StorageService.addNotification(agentRecord);

    return { clientNotification: clientRecord, agentNotification: agentRecord };
  }
};
