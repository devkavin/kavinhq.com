import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import SettingsPanel from "../src/admin/components/SettingsPanel";

test("settings panel prefills and submits WhatsApp values", () => {
  const save = vi.fn();
  render(<SettingsPanel settings={{ whatsapp_number: "15550192834", whatsapp_message: "Hello KAVINHQ!" }} onSave={save}/>);
  expect(screen.getByLabelText("WhatsApp number")).toHaveValue("15550192834");
  fireEvent.change(screen.getByLabelText("Opening message"), { target: { value: "Hello from the updated site." } });
  fireEvent.submit(screen.getByTestId("admin-settings-form"));
  expect(save).toHaveBeenCalledWith({ whatsapp_number: "15550192834", whatsapp_message: "Hello from the updated site." });
});
