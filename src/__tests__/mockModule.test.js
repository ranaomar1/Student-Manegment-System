jest.mock("../utils/math", () => ({
  multiply: jest.fn(() => 100)
}));

import { multiply } from "../utils/math";

test("mocked multiply", () => {

  expect(multiply(2, 3))
    .toBe(100);

});