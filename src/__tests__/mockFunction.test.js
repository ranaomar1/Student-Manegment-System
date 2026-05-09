test("mock function works", () => {

  const mockSave = jest.fn();

  mockSave();

  expect(mockSave)
    .toHaveBeenCalled();

});