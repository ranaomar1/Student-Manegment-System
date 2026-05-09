import { fetchStudents } from "../api/fetchStudents";

test("fetch students async", async () => {

  const students = await fetchStudents();

  expect(students.length).toBe(1);

  expect(students[0].name)
    .toBe("Rana");

});