test("student object matches", () => {

  const student = {
    id: 1,
    name: "Aya"
  };

  expect(student).toEqual({
    id: 1,
    name: "Rana"
  });

});