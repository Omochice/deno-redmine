import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

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
            { value: "0.5.x" },
            { value: "0.6.x" },
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
      ],
    });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/custom_fields.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
];
