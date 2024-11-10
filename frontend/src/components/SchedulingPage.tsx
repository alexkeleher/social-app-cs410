import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';

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
    const [matrix, setMatrix] = useState<number[][]>(
        Array(7).fill(Array(19).fill(0))
    );
    const [timeRows, setTimeRows] = useState<JSX.Element[]>([]);

    // When this component first loads, populate the matrix by reading serialized string of users schedule from the DB.
    useEffect(() => {
        // define an async function inside useEffect
        const fetchSerializedMatrixAndSetStateMatrix = async () => {
            // Create a 2d array of numbers of dimensions 7 by 19 initialized with all zeroes
            let newMatrix: number[][] = Array.from({ length: 7 }, () =>
                Array(19).fill(0)
            );

            let serializedMatrix: string =
                await getUserSerializedScheduleFromDB();

            // let serializedMatrix =
            //     '1100000000000110000000000000110000000000000000000000000000000000011110000000000000000000000000000000000000000000000000000000011111000';
            if (serializedMatrix.length != 133) {
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
            console.log(
                'fetching user information from DB to get serialized schedule'
            );
            const responseUserData = await api.get(`/users${auth.id}`);
            return responseUserData.data.serializedschedulematrix;
        } catch (error) {
            console.error(error);
            return ''; // Return default string in case of error
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
            for (let i = 0; i < 7; i++) {
                timeBlocks.push(
                    <>
                        <div
                            className={`slot ${matrix[i][j] == 0 ? 'off' : 'yes'}`}
                            onClick={() => handleOnClickSlot(i, j)}
                        >
                            {timeSlots[j]}
                        </div>
                    </>
                );
            }
            newTimeRows.push(
                <div key={j} className="time-row">
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
        const deepCopy: number[][] = matrix.map((dayOfWeekAr) => [
            ...dayOfWeekAr,
        ]);

        // if the matrix entry is 1, set to 0, if it's 0, set to 1. Update it in the deep copy
        deepCopy[i][j] = deepCopy[i][j] == 0 ? 1 : 0;

        // use setMatrix to set the new useState matrix and force a UI rebuild of the schedule
        setMatrix(deepCopy);
    };

    const savePreferences = async () => {
        setSaveMessage('');
        try {
            console.log(
                'Attempting to store new preference for Schedule on the database for this user'
            );
            const serializedScheduleMatrix =
                serializeMatrixToLongString(matrix);
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

    // Input is a day of week string (Monday, Tuesday, etc)
    const handleDayClick = (day: string) => {
        // find the index for this day

        // Below code is just a switch to map out the index for the day value passed in
        const indexOfDayInMatrix =
            {
                Monday: 0,
                Tuesday: 1,
                Wednesday: 2,
                Thursday: 3,
                Friday: 4,
                Saturday: 5,
                Sunday: 6,
            }[day] || -1;

        // Make deep copy
        const deepCopy: number[][] = matrix.map((row) => [...row]);

        if (deepCopy[indexOfDayInMatrix][0] == 0) {
            // fill this whole weekday's block with 1's
            for (let j = 0; j < 19; j++) {
                deepCopy[indexOfDayInMatrix][j] = 1;
            }
        } else {
            // fill this whole weekday's block with 0's
            for (let j = 0; j < 19; j++) {
                deepCopy[indexOfDayInMatrix][j] = 0;
            }
        }
        setMatrix(deepCopy);
    };

    return (
        <>
            <div className="scheduling-container">
                <h1>Select Your Availability</h1>

                <div className="scheduling-grid">
                    {/* Show the day of the week column headers */}
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
                    {/* Show the time blocks */}
                    {timeRows}
                </div>
            </div>

            <div className="save-preferences">
                <button
                    onClick={savePreferences}
                    // disabled={isSaving}
                    className="save-button"
                >
                    Save Preferences
                </button>
                {saveMessage && (
                    <p
                        className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}
                    >
                        {saveMessage}
                    </p>
                )}
            </div>
        </>
    );
};

export default SchedulingPage;
