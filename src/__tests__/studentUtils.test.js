import { addStudent } from "../utils/studentUtils";

describe("addStudent", () => {

  test("adds a student successfully", () => {

    const students = [];

    const result = addStudent(students, {
      id: 1,
      name: "Rana"
    });

    expect(result.length).toBe(1);

    expect(result[0].name).toBe("Rana");
  });

  test("throws error if name missing", () => {

    expect(() => {

      addStudent([], {
        id: 1
      });

    }).toThrow("Name is required");

  });

});