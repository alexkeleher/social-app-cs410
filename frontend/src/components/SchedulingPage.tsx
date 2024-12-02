import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = [
    '5:00-6:00 AM',
    '6:00-7:00 AM',
    '7:00-8:00 AM',
    '8:00-9:00 AM',
    '9:00-10:00 AM',
    '10:00-11:00 AM',
    '11:00-12:00 AM',
    '12:00-1:00 PM',
    '1:00-2:00 PM',
    '2:00-3:00 PM',
    '3:00-4:00 PM',
    '4:00-5:00 PM',
    '5:00-6:00 PM',
    '6:00-7:00 PM',
    '7:00-8:00 PM',
    '8:00-9:00 PM',
    '9:00-10:00 PM',
    '10:00-11:00 PM',
    '11:00-12:00 PM',
];

const SchedulingPage: React.FC = () => {
    const { auth } = useContext(AuthContext); // Get the logged in user ID from context
    const [saveMessage, setSaveMessage] = useState('');

    // Declare matrix
    const [matrix, setMatrix] = useState<number[][]>(Array(7).fill(Array(19).fill(0)));
    const [timeRows, setTimeRows] = useState<JSX.Element[]>([]);

    // When this component first loads, populate the matrix by reading serialized string of users schedule from the DB.
    useEffect(() => {
        // define an async function inside useEffect
        const fetchSerializedMatrixAndSetStateMatrix = async () => {
            // Create a 2d array of numbers of dimensions 7 by 19 initialized with all zeroes
            let newMatrix: number[][] = Array.from({ length: 7 }, () => Array(19).fill(0));

            let serializedMatrix: string = await getUserSerializedScheduleFromDB();

            // let serializedMatrix =
            //     '1100000000000110000000000000110000000000000000000000000000000000011110000000000000000000000000000000000000000000000000000000011111000';
            if (serializedMatrix.length !== 133) {
                setSaveMessage('Serialized matrix from DB was not valid!');
                setTimeout(() => setSaveMessage(''), 3000);
                console.log('serialized matrix string was not valid');

                // If we fail to get one from the db, load a default serialized schedule
                serializedMatrix =
                    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
            }

            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 19; j++) {
                    newMatrix[i][j] = Number(serializedMatrix[19 * i + j]);
                }
            }
            setMatrix(newMatrix);
        };

        fetchSerializedMatrixAndSetStateMatrix();
    }, []);

    const getUserSerializedScheduleFromDB = async (): Promise<string> => {
        try {
            console.log('fetching user information from DB to get serialized schedule');
            const responseUserData = await api.get(`/users${auth.id}`);

            // Check if we have valid data
            if (!responseUserData?.data?.serializedschedulematrix) {
                console.log('No schedule found in DB, using default empty schedule');
                return '0'.repeat(133); // Return default empty schedule (7 days * 19 time slots)
            }

            return responseUserData.data.serializedschedulematrix;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return '0'.repeat(133); // Return default empty schedule on error
        }
    };

    // Build each row of time blocks here. Store them in a new array of time rows. Then put the array inside the return {arrayOfRows} or something like that
    useEffect(() => {
        buildTimeBlocksAfterMatrixLoad();
    }, [matrix]);

    const buildTimeBlocksAfterMatrixLoad = () => {
        console.log('building time blocks');
        const newTimeRows: JSX.Element[] = [];
        for (let j = 0; j < 19; j++) {
            const timeBlocks: JSX.Element[] = [];

            // First column: Time selector button
            timeBlocks.push(
                <button key={`time-${j}`} className="time-select-button" onClick={() => handleTimeRowClick(j)}>
                    {timeSlots[j]}
                </button>
            );

            // Add day columns
            for (let i = 0; i < 7; i++) {
                timeBlocks.push(
                    <div
                        key={`slot-${i}`}
                        className={`slot ${matrix[i][j] === 0 ? 'off' : 'yes'}`}
                        onClick={() => handleOnClickSlot(i, j)}
                    >
                        {timeSlots[j]}
                    </div>
                );
            }

            newTimeRows.push(
                <div key={`row-${j}`} className="time-row">
                    {timeBlocks}
                </div>
            );
        }
        setTimeRows(newTimeRows);
    };

    const handleOnClickSlot = (i: number, j: number) => {
        // Make deep copy of the useState matrix
        //  How map(row => [...row]) creates a proper deep copy by:
        //  Creating a new outer array via map()
        //  Creating new inner arrays via [...row] for each row
        const deepCopy: number[][] = matrix.map((dayOfWeekAr) => [...dayOfWeekAr]);

        // if the matrix entry is 1, set to 0, if it's 0, set to 1. Update it in the deep copy
        deepCopy[i][j] = deepCopy[i][j] === 0 ? 1 : 0;

        // use setMatrix to set the new useState matrix and force a UI rebuild of the schedule
        setMatrix(deepCopy);
    };

    const savePreferences = async () => {
        setSaveMessage('');
        try {
            console.log('Attempting to store new preference for Schedule on the database for this user');
            const serializedScheduleMatrix = serializeMatrixToLongString(matrix);
            const response = await api.put(`/users/${auth.id}`, {
                SerializedScheduleMatrix: serializedScheduleMatrix,
            });
            setSaveMessage('Preferences saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setSaveMessage('Preferences DID NOT SAVE! ERROR!');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const serializeMatrixToLongString = (inputMatrix: number[][]) => {
        const stringBuilder: string[] = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 19; j++) {
                stringBuilder.push(String(inputMatrix[i][j]));
            }
        }
        return stringBuilder.join('');
    };

    // Add handleTimeRowClick function
    const handleTimeRowClick = (rowIndex: number) => {
        const deepCopy: number[][] = matrix.map((row) => (Array.isArray(row) ? [...row] : Array(19).fill(0)));

        // Check first slot of the row to determine current state
        const isCurrentlyEmpty = !deepCopy[0][rowIndex];

        // Fill entire row across all days
        for (let i = 0; i < 7; i++) {
            deepCopy[i][rowIndex] = isCurrentlyEmpty ? 1 : 0;
        }

        setMatrix(deepCopy);
    };

    // Input is a day of week string (Monday, Tuesday, etc)
    const handleDayClick = (day: string) => {
        const dayIndex =
            {
                Monday: 0,
                Tuesday: 1,
                Wednesday: 2,
                Thursday: 3,
                Friday: 4,
                Saturday: 5,
                Sunday: 6,
            }[day] ?? -1;

        // Check if dayIndex is valid
        if (dayIndex === -1) {
            console.error('Invalid day selected');
            return;
        }

        // Ensure matrix exists and has valid structure
        if (!matrix || !Array.isArray(matrix) || !matrix[dayIndex]) {
            console.error('Matrix not properly initialized');
            return;
        }

        // Make deep copy with null check
        const deepCopy: number[][] = matrix.map((row) => (Array.isArray(row) ? [...row] : Array(19).fill(0)));

        // Check first time slot of the day
        const isCurrentlyEmpty = !deepCopy[dayIndex][0];

        // Fill the entire day
        for (let j = 0; j < 19; j++) {
            deepCopy[dayIndex][j] = isCurrentlyEmpty ? 1 : 0;
        }

        setMatrix(deepCopy);
    };

    return (
        <div className="scheduling-container">
            <h1>Select Your Availability</h1>

            <div className="schedule-grid">
                {/* Empty corner cell for alignment */}
                <div className="corner-cell"></div>

                {/* Days header */}
                {daysOfWeek.map((day) => (
                    <div key={day} className="day-header" onClick={() => handleDayClick(day)}>
                        {day}
                    </div>
                ))}

                {/* Time slots and selection grid */}
                {timeSlots.map((time, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <button className="time-label" onClick={() => handleTimeRowClick(rowIndex)}>
                            {time}
                        </button>
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                            <div
                                key={`${rowIndex}-${dayIndex}`}
                                className={`grid-cell ${matrix[dayIndex][rowIndex] === 1 ? 'selected' : ''}`}
                                onClick={() => handleOnClickSlot(dayIndex, rowIndex)}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>

            <div className="save-preferences">
                <button onClick={savePreferences} className="save-button">
                    Save Preferences
                </button>
                {saveMessage && (
                    <p className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                        {saveMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SchedulingPage;
