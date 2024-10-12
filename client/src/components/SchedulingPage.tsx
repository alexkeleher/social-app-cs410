import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SchedulingPageProps {
    goToBack: () => void; // Define goToBack as a prop
}

const SchedulingPage: React.FC<SchedulingPageProps> = ({ goToBack }) => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());

    return (
        <div>
            <h1>Scheduling Page</h1>
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)} // Update the state when the date changes
                dateFormat="MMMM d, yyyy" // Format for the date display
                className="date-picker" // Optional: add a class for styling
            />

            <p></p>
            <button onClick={goToBack} className="back-button">
                Back to Preferences
            </button>
        </div>
    );
};

export default SchedulingPage;
