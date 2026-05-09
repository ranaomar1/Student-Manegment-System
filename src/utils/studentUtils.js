export function addStudent(students, newStudent) {

  if (!newStudent.name) {
    throw new Error("Name is required");
  }

  return [...students, newStudent];
}