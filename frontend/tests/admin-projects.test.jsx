import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ProjectTable from "../src/admin/components/ProjectTable";
import { formToPayload, projectToForm } from "../src/admin/lib/projectForm";
import { projectList } from "./fixtures/projects";

test("project form conversion preserves gallery, featured and sort values", () => {
  const form = projectToForm(projectList[0]);
  form.gallery = "https://one.test/a.jpg\nhttps://two.test/b.jpg";
  form.featured = true;
  form.sort_order = "7";
  const payload = formToPayload(form);
  expect(payload.gallery).toEqual(["https://one.test/a.jpg", "https://two.test/b.jpg"]);
  expect(payload.featured).toBe(true);
  expect(payload.sort_order).toBe(7);
});

test("project deletion requires two explicit clicks", () => {
  const remove = vi.fn();
  render(<ProjectTable projects={[projectList[0]]} onEdit={() => {}} onDelete={remove}/>);
  fireEvent.click(screen.getByTestId("admin-delete-apexmetrics"));
  expect(remove).not.toHaveBeenCalled();
  expect(screen.getByTestId("admin-delete-apexmetrics")).toHaveTextContent("Confirm delete");
  fireEvent.click(screen.getByTestId("admin-delete-apexmetrics"));
  expect(remove).toHaveBeenCalledWith(projectList[0]);
});
