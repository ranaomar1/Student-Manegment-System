/**
 * services/api.js
 * ──────────────────────────────────────────────────────────
 * Thin wrapper around DummyJSON (https://dummyjson.com)
 * Used to seed realistic student data & demonstrate API integration.
 *
 * All functions return { data, error } so callers never need try/catch.
 * ──────────────────────────────────────────────────────────
 */

const BASE = 'https://dummyjson.com';

// ── internal fetch helper ──────────────────────────────────
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    console.warn('[API]', err.message);
    return { data: null, error: err.message };
  }
}

// ── Grades helper (deterministic from user id) ────────────
const GRADES  = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
const DEPTS   = ['Mathematics', 'Science', 'Arabic', 'English', 'History', 'Arts', 'IT', 'Administration'];

function pickGrade(id)  { return GRADES[id % GRADES.length]; }
function pickDept(id)   { return DEPTS[id  % DEPTS.length]; }
function pickStatus(id) { return id % 5 === 0 ? 'Inactive' : 'Active'; }
function pickAge(dob) {
  if (!dob) return 20;
  const birth = new Date(dob);
  const diff  = Date.now() - birth.getTime();
  return Math.max(17, Math.min(30, Math.floor(diff / (365.25 * 24 * 3600 * 1000))));
}

// ── Map a DummyJSON user → our Student shape ──────────────
function mapUser(u) {
  return {
    id:         u.id,
    name:       `${u.firstName} ${u.lastName}`,
    age:        pickAge(u.birthDate) || u.age || 20,
    grade:      pickGrade(u.id),
    status:     pickStatus(u.id),
    department: pickDept(u.id),
    email:      u.email,
    phone:      u.phone,
    birthday:   u.birthDate || '',
    notes:      `Student from ${u.university || 'the university'}. Major: ${u.company?.department || pickDept(u.id)}.`,
    avatar:     u.image || '',
    createdAt:  Date.now() - Math.random() * 864e5 * 60,
    timeline:   [{ action: 'Added', date: Date.now() - Math.random() * 864e5 * 30 }],
    fromApi:    true,
  };
}

// ─────────────────────────────────────────────────────────
//  STUDENTS
// ─────────────────────────────────────────────────────────

/**
 * Fetch a page of students from DummyJSON /users
 * @param {number} limit   – how many to fetch (max 30)
 * @param {number} skip    – offset for pagination
 * @returns {{ data: Student[], total: number, error }}
 */
export async function fetchStudents(limit = 10, skip = 0) {
  const { data, error } = await apiFetch(`/users?limit=${limit}&skip=${skip}&select=id,firstName,lastName,age,birthDate,email,phone,image,university,company`);
  if (error || !data) return { data: [], total: 0, error };
  return {
    data:  data.users.map(mapUser),
    total: data.total,
    error: null,
  };
}

/**
 * Search students by name via DummyJSON /users/search
 */
export async function searchStudentsApi(query) {
  if (!query.trim()) return fetchStudents(10, 0);
  const { data, error } = await apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
  if (error || !data) return { data: [], total: 0, error };
  return {
    data:  data.users.map(mapUser),
    total: data.total,
    error: null,
  };
}

/**
 * Get a single student by id
 */
export async function fetchStudentById(id) {
  const { data, error } = await apiFetch(`/users/${id}`);
  if (error || !data) return { data: null, error };
  return { data: mapUser(data), error: null };
}

// ─────────────────────────────────────────────────────────
//  AUTH  (DummyJSON auth endpoint)
// ─────────────────────────────────────────────────────────

/**
 * Demo login against DummyJSON — returns a token + user.
 * Note: In real app you'd validate the token server-side.
 */
export async function apiLogin(username, password) {
  const { data, error } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
  if (error || !data) return { data: null, error: error || 'Login failed' };
  return { data, error: null };
}

// ─────────────────────────────────────────────────────────
//  POSTS  (used for "Announcements" or notices)
// ─────────────────────────────────────────────────────────

export async function fetchAnnouncements(limit = 5) {
  const { data, error } = await apiFetch(`/posts?limit=${limit}&select=id,title,body,tags,reactions`);
  if (error || !data) return { data: [], error };
  return { data: data.posts, error: null };
}

// ─────────────────────────────────────────────────────────
//  QUOTES  (used as motivational quotes on Dashboard)
// ─────────────────────────────────────────────────────────

export async function fetchRandomQuote() {
  const { data, error } = await apiFetch('/quotes/random');
  if (error || !data) return { data: null, error };
  return { data, error: null };
}

// ─────────────────────────────────────────────────────────
//  UTILITY
// ─────────────────────────────────────────────────────────

/** Check if API is reachable */
export async function pingApi() {
  const { error } = await apiFetch('/test');
  return !error;
}
