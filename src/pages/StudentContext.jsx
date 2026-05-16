import React, { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

export function StudentProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    const addStudent = (student) => {
        const newStudent = {
            ...student,
            id: Date.now(),
        };

        setStudents(prev => [...prev, newStudent]);

        setActivityLog(prev => [
            {
                id: Date.now(),
                action: 'Added',
                studentName: student.name,
                studentId: newStudent.id,
                date: Date.now(),
            },
            ...prev
        ]);
    };

    return (
        <StudentContext.Provider value={{
            students,
            addStudent,
            activityLog
        }}>
            {children}
        </StudentContext.Provider>
    );
}

export const useStudents = () => useContext(StudentContext);