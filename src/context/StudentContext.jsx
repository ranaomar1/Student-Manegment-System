import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = 'https://dummyjson.com/users';

const StudentContext = createContext();

const initialStudents = [];

// Bump this version whenever student schema or ID space changes
const STUDENT_DATA_VERSION = 'v2';

function loadFromStorage() {
  try {
    // If data version mismatch, wipe stale student data so fresh API fetch runs
    const ver = localStorage.getItem('sms_data_version');
    if (ver !== STUDENT_DATA_VERSION) {
      localStorage.removeItem('sms_students');
      localStorage.removeItem('sms_nextId');
      localStorage.setItem('sms_data_version', STUDENT_DATA_VERSION);
    }
    const s = localStorage.getItem('sms_students');
    const n = localStorage.getItem('sms_nextId');
    const al = localStorage.getItem('sms_activityLog');
    const rv = localStorage.getItem('sms_recentlyViewed');
    return {
      students: s ? JSON.parse(s) : initialStudents,
      nextId: n ? Number(n) : 10001,
      activityLog: al ? JSON.parse(al) : [],
      recentlyViewed: rv ? JSON.parse(rv) : [],
    };
  } catch {
    return { students: initialStudents, nextId: 10001, activityLog: [], recentlyViewed: [] };
  }
}

function applyDark(dark) {
  document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
}

export function StudentProvider({ children }) {
  const [students,       setStudents]       = useState(() => loadFromStorage().students);
  const [loading, setLoading] = useState(false);
  const [nextId,         setNextId]         = useState(() => loadFromStorage().nextId);
  const [dark,           setDarkState]      = useState(() => localStorage.getItem('sms_dark') === 'true');
  const [selectedIds,    setSelectedIds]    = useState([]);
  const [activityLog,    setActivityLog]    = useState(() => loadFromStorage().activityLog);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    // Always read fresh from localStorage - respects logout clearing
    try {
      const rv = localStorage.getItem('sms_recentlyViewed');
      return rv ? JSON.parse(rv) : [];
    } catch { return []; }
  });

  const setDark = useCallback((v) => {
    const next = typeof v === 'function' ? v(dark) : v;
    setDarkState(next);
    localStorage.setItem('sms_dark', String(next));
    applyDark(next);
  }, [dark]);

  useEffect(() => { applyDark(dark); }, []);

  useEffect(() => {
    localStorage.setItem('sms_students', JSON.stringify(students));
    localStorage.setItem('sms_nextId', String(nextId));
  }, [students, nextId]);

  useEffect(() => {
    localStorage.setItem('sms_activityLog', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem('sms_recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
  // Only fetch from API if no students are saved locally
  const existingStudents = localStorage.getItem('sms_students');
  if (existingStudents) {
    try {
      const parsed = JSON.parse(existingStudents);
      if (parsed && parsed.length > 0) return;
    } catch {}
  }

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();

      const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4'];
      const formatted = data.users.map(user => {
        // Stable deterministic values based on user id
        const gradeIdx = (user.id - 1) % 4;   // 0→G1,1→G2,2→G3,3→G4 cycling
        const isActive = user.id % 3 !== 0;   // independent of grade
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          age: Math.min(user.age, 26),
          grade: GRADES[gradeIdx],
          status: isActive ? 'Active' : 'Inactive',
          notes: user.company?.title || 'Student',
          birthday: user.birthDate,
          createdAt: Date.now(),
          timeline: [{ action: 'Imported from API', date: Date.now() }]
        };
      });

      setStudents(formatted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, []);

  const addLog = useCallback((action, studentName, studentId) => {
    setActivityLog(prev => [{
      id: Date.now() + Math.random(),
      action, studentName, studentId, date: Date.now()
    }, ...prev].slice(0, 100));
  }, []);

  const addStudent = useCallback((data) => {
    const now = Date.now();
    const newStudent = { id: nextId, ...data, createdAt: now, timeline: [{action:'Added', date: now}] };
    setStudents(prev => [...prev, newStudent]);
    setNextId(n => n + 1);
    addLog('Added', data.name, nextId);
  }, [nextId, addLog]);

  const deleteStudent = useCallback((id) => {
    const s = students.find(st => st.id === id);
    setStudents(prev => prev.filter(st => st.id !== id));
    if (s) addLog('Deleted', s.name, id);
  }, [students, addLog]);

  const deleteMany = useCallback((ids) => {
    ids.forEach(id => {
      const s = students.find(st => st.id === id);
      if (s) addLog('Deleted', s.name, id);
    });
    setStudents(prev => prev.filter(s => !ids.includes(s.id)));
    setSelectedIds([]);
  }, [students, addLog]);

  const editStudent = useCallback((id, data) => {
    const now = Date.now();
    setStudents(prev => prev.map(s => s.id === id
      ? { ...s, ...data, timeline: [...(s.timeline||[]), {action:'Edited', date: now}] }
      : s
    ));
    const s = students.find(st => st.id === id);
    if (s) addLog('Edited', data.name || s.name, id);
  }, [students, addLog]);

  const getStudent = useCallback((id) => students.find(s => s.id === Number(id)), [students]);

  const trackView = useCallback((student) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(s => s.id !== student.id);
      return [{ id: student.id, name: student.name, grade: student.grade, status: student.status }, ...filtered].slice(0, 3);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  const toggleSelect = useCallback((id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i=>i!==id) : [...prev, id]), []);
  const clearSelect  = useCallback(() => setSelectedIds([]), []);

  return (
    <StudentContext.Provider value={{
      students, addStudent, deleteStudent, deleteMany, editStudent, getStudent,
      dark, setDark,
      selectedIds, toggleSelect, clearSelect,
      activityLog,
      recentlyViewed, trackView, clearRecentlyViewed,
      loading,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  return useContext(StudentContext);
}
