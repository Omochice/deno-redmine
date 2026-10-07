import { http, HttpResponse } from "npm:msw@2.15.0";
import { unprocessableEntity } from "../_msw.ts";

/** Client context pointing at the mocked Redmine endpoint. */
export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

/** Handlers that answer the custom fields listing successfully. */
export const validHandlers = [
  http.get(`${context.endpoint}/custom_fields.json`, () => {
    return HttpResponse.json({
      custom_fields: [
        {
          id: 1,
          name: "Affected version",
          customized_type: "issue",
          field_format: "list",
          is_required: true,
          is_filter: true,
          searchable: true,
          multiple: true,
          visible: false,
          possible_values: [
            { value: "0.5.x", label: "v0.5.x" },
            { value: "0.6.x", label: null },
          ],
          trackers: [{ id: 1, name: "Bug" }],
          roles: [{ id: 3, name: "Manager" }],
        },
        {
          id: 2,
          name: "Database",
          customized_type: "project",
          field_format: "string",
          regexp: null,
          min_length: null,
          max_length: null,
          is_required: false,
          is_filter: false,
          searchable: false,
          multiple: false,
          default_value: null,
          visible: true,
        },
        {
          id: 3,
          name: "Legacy list",
          customized_type: "issue",
          field_format: "list",
          is_required: false,
          is_filter: false,
          searchable: false,
          multiple: false,
          visible: true,
          possible_values: ["a", "b"],
        },
      ],
    });
  }),
];

/** Handlers that answer the custom fields listing with a Redmine validation error. */
export const invalidHandlers = [
  http.get(`${context.endpoint}/custom_fields.json`, () => {
    return unprocessableEntity();
  }),
];
