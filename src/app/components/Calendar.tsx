import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
  birthday?: string; // Optional birthday field
}

interface CustomEvent {
  id: string;
  name: string;
  date: Date;
  description?: string;
  color: string;
}

interface CalendarProps {
  profiles: Profile[];
  customEvents?: CustomEvent[];
}

const HOLIDAYS = [
  { name: "Christmas", date: "12-25", type: "holiday" },
  { name: "Valentine's Day", date: "02-14", type: "holiday" },
  { name: "Mother's Day", date: "05-12", type: "holiday" }, // CHANGES YEARLY: Second Sunday in May
  { name: "Father's Day", date: "06-16", type: "holiday" }, // CHANGES YEARLY:Third Sunday in June
  { name: "Easter", date: "03-31", type: "holiday" }, // CHANGES YEARLY: MAKE SURE TO UPDATE EVERY YEAR
  { name: "Thanksgiving", date: "11-28", type: "holiday" }, // CHANGES YEARLY: Fourth Thursday in November
  { name: "Halloween", date: "10-31", type: "holiday" },
  { name: "New Year's Day", date: "01-01", type: "holiday" },
];

export default function Calendar({ profiles, customEvents = [] }: CalendarProps) {
  // Get current year
  const now = new Date();
  const currentYear = now.getFullYear();

  // Combine all events (holidays, birthdays, custom events) with full date objects
  const events = [
    ...HOLIDAYS.map(h => ({
      name: h.name,
      date: new Date(`${currentYear}-${h.date}`),
      type: "holiday" as const,
    })),
    ...profiles
      .filter(profile => profile.birthday)
      .map(profile => ({
        name: `${profile.name}'s Birthday`,
        date: new Date(`${currentYear}-${profile.birthday}`),
        type: "birthday" as const,
      })),
    ...customEvents.map(event => ({
      name: event.name,
      date: new Date(event.date),
      type: "custom" as const,
      color: event.color,
      description: event.description,
    })),
  ];

  // Sort events by date
  const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get upcoming events (next 60 days)
  const today = new Date();
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(today.getDate() + 60);

  const upcomingEvents = sortedEvents.filter(event =>
    event.date >= today && event.date <= sixtyDaysFromNow
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon size={20} className="text-pink-600" />
        <h3 className="font-medium text-gray-800">Upcoming Events</h3>
      </div>
      
      <div className="space-y-3">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                event.type === 'holiday'
                  ? 'bg-gradient-to-r from-pink-50 to-orange-50'
                  : event.type === 'custom'
                    ? ''
                    : 'bg-gradient-to-r from-blue-50 to-purple-50'
              }`}
              style={event.type === 'custom' && 'color' in event ? { background: (event.color || '#FF6B6B') + '20' } : {}}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{event.name}</span>
                <span className="text-sm text-gray-500">
                  {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {event.type === 'holiday' ? 'Holiday' : event.type === 'custom' ? 'Event' : 'Birthday'}
                {event.type === 'custom' && 'description' in event && event.description && typeof event.description === 'string' ? (
                  <span className="block text-xs text-gray-600 mt-0.5">{event.description}</span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No upcoming events in the next 60 days</p>
        )}
      </div>
    </div>
  );
} 