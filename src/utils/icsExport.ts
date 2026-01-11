import { format, addHours, parseISO } from 'date-fns';

interface ICSEvent {
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  uid?: string;
}

function formatICSDate(date: string, time?: string): string {
  const d = parseISO(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    d.setHours(parseInt(hours), parseInt(minutes));
  }
  return format(d, "yyyyMMdd'T'HHmmss");
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICSContent(events: ICSEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Top-Focus//Habit Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((event, index) => {
    const uid = event.uid || `event-${index}-${Date.now()}@top-focus.app`;
    const startDT = formatICSDate(event.startDate, event.startTime);
    const endDT = event.endDate 
      ? formatICSDate(event.endDate, event.endTime)
      : formatICSDate(event.startDate, event.startTime ? 
          format(addHours(parseISO(`${event.startDate}T${event.startTime}`), 1), 'HH:mm') : 
          undefined);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
    lines.push(`DTSTART:${startDT}`);
    lines.push(`DTEND:${endDT}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeICS(event.location)}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(content: string, filename: string = 'calendar.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export habits to ICS
export function exportHabitsToICS(habits: Array<{
  id: string;
  name: string;
  icon: string;
  completedDates: string[];
}>): void {
  const events: ICSEvent[] = [];
  
  habits.forEach(habit => {
    habit.completedDates.forEach(date => {
      events.push({
        title: `${habit.icon} ${habit.name}`,
        startDate: date,
        startTime: '09:00',
        uid: `habit-${habit.id}-${date}@top-focus.app`,
        description: 'Habit completed',
      });
    });
  });

  const content = generateICSContent(events);
  downloadICS(content, 'habits-export.ics');
}

// Export tasks to ICS
export function exportTasksToICS(tasks: Array<{
  id: string;
  name: string;
  icon: string;
  dueDate: string;
  dueTime?: string;
  description?: string;
  completed: boolean;
}>): void {
  const events: ICSEvent[] = tasks.map(task => ({
    title: `${task.icon} ${task.name}${task.completed ? ' ✓' : ''}`,
    startDate: task.dueDate,
    startTime: task.dueTime || '09:00',
    uid: `task-${task.id}@top-focus.app`,
    description: task.description,
  }));

  const content = generateICSContent(events);
  downloadICS(content, 'tasks-export.ics');
}