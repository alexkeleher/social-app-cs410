import React, { useState } from 'react';

const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];
const timeSlots = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
];

// Define the possible states for time slots
enum PreferenceState {
    OFF = 'Off',
    YES = 'Yes',
    NO = 'No',
}

const SchedulingPage: React.FC = () => {
    // State to hold preferences for each day and time slot
    const [preferences, setPreferences] = useState<{
        [key: string]: PreferenceState;
    }>({});

    const handleSlotClick = (day: string, time: string) => {
        const key = `${day}-${time}`;
        setPreferences((prev) => {
            const currentPreference = prev[key] || PreferenceState.OFF; // Default to OFF if not set
            let nextPreference: PreferenceState;

            // Cycle through OFF -> YES -> NO -> OFF
            if (currentPreference === PreferenceState.OFF) {
                nextPreference = PreferenceState.YES;
            } else if (currentPreference === PreferenceState.YES) {
                nextPreference = PreferenceState.NO;
            } else {
                nextPreference = PreferenceState.OFF;
            }

            return {
                ...prev,
                [key]: nextPreference,
            };
        });
    };

    // Function to handle selecting or deselecting an entire day
    const handleDayClick = (day: string) => {
        const isAnyYes = timeSlots.some(
            (time) => preferences[`${day}-${time}`] === PreferenceState.YES
        );

        const newState = isAnyYes ? PreferenceState.OFF : PreferenceState.YES;

        setPreferences((prev) => {
            const updatedPreferences = { ...prev };
            timeSlots.forEach((time) => {
                const key = `${day}-${time}`;
                updatedPreferences[key] = newState;
            });
            return updatedPreferences;
        });
    };

    return (
        <div className="scheduling-container">
            <h1>Schedule Your Appointment</h1>
            <div className="scheduling-grid">
                <div className="days-row">
                    {daysOfWeek.map((day) => (
                        <div
                            key={day}
                            className="day-item"
                            onClick={() => handleDayClick(day)} // Clickable day to select/deselect all
                        >
                            {day}
                        </div>
                    ))}
                </div>
                {timeSlots.map((time) => (
                    <div key={time} className="time-row">
                        {daysOfWeek.map((day) => {
                            const key = `${day}-${time}`;
                            const preference =
                                preferences[key] || PreferenceState.OFF; // Default to OFF if not set
                            return (
                                <div
                                    key={key}
                                    className={`slot ${preference.toLowerCase()}`} // Apply dynamic class based on preference
                                    onClick={() => handleSlotClick(day, time)}
                                >
                                    {time} {/* Display the time */}
                                    {preference === PreferenceState.NO}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SchedulingPage;
