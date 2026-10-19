import { BookingRequest } from '../types';

export const CalendarService = {
  getGoogleCalendarUrl(booking: BookingRequest): string {
    const [startTime, endTime] = booking.timeSlot.split(' - ');
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const [year, month, day] = booking.date.split('-').map(Number);

    const startDate = new Date(Date.UTC(year, month - 1, day, startH, startM));
    const endDate = new Date(Date.UTC(year, month - 1, day, endH, endM));

    const formatGDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`Private Viewing: ${booking.propertyTitle}`);
    const details = encodeURIComponent(`Private in-person real estate viewing.\nClient: ${booking.clientName}\nPhone: ${booking.clientPhone}`);
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  },

  downloadIcsFile(booking: BookingRequest): void {
    const [startTime, endTime] = booking.timeSlot.split(' - ');
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const [year, month, day] = booking.date.split('-').map(Number);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`;
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(endH)}${pad(endM)}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AURA Estates//Viewing Booking//EN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@auraestates.com`,
      `DTSTAMP:${startStr}Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Private Viewing - ${booking.propertyTitle}`,
      `DESCRIPTION:Private in-person property viewing for ${booking.clientName}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viewing-${booking.date}-${booking.id.slice(0, 8)}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
