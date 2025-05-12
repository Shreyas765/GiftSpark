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

interface CalendarProps {
  profiles: Profile[];
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

export default function Calendar({ profiles }: CalendarProps) {
  // Get current year
  const now = new Date();
  const currentYear = now.getFullYear();

  // Get all events (holidays and birthdays)
  const events = [
    ...HOLIDAYS,
    ...profiles
      .filter(profile => profile.birthday)
      .map(profile => ({
        name: `${profile.name}'s Birthday`,
        date: profile.birthday,
        type: "birthday" as const
      }))
  ];

  // Sort events by date
  const sortedEvents = events.sort((a, b) => {
    const dateA = new Date(`${currentYear}-${a.date}`);
    const dateB = new Date(`${currentYear}-${b.date}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Get upcoming events (next 30 days)
  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = new Date(`${currentYear}-${event.date}`);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 60);
    return eventDate >= today && eventDate <= thirtyDaysFromNow;
  });

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
                  : 'bg-gradient-to-r from-blue-50 to-purple-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{event.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(`${currentYear}-${event.date}`).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {event.type === 'holiday' ? 'Holiday' : 'Birthday'}
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