global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { id: 1, name: "Rana" }
      ])
  })
);

test("API returns students", async () => {

  const response =
    await fetch("/students");

  const data =
    await response.json();

  expect(data[0].id)
    .toBe(1);

});