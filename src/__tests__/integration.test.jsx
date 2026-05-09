import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

test("user adds new student", async () => {

  render(<App />);

  const input =
    screen.getByPlaceholderText("Student Name");

  const button =
    screen.getByText("Add");

  await userEvent.type(input, "Rana");

  await userEvent.click(button);

  expect(screen.getByText("Rana"))
    .toBeInTheDocument();

});