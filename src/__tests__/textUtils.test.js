import { capitalize } from "../utils/textUtils";

test("capitalizes first character", () => {

  expect(capitalize("Rana"))
    .toBe("Rana");

});