import type { IdName } from "../../internal/type.ts";

export type PossibleValue = {
  value: string;
  label?: string;
};

export type CustomField = {
  id: number;
  name: string;
  customizedType: string;
  fieldFormat: string;
  regexp?: string;
  minLength?: number;
  maxLength?: number;
  isRequired: boolean;
  isFilter: boolean;
  searchable: boolean;
  multiple: boolean;
  defaultValue?: string;
  visible: boolean;
  possibleValues?: PossibleValue[];
  trackers?: IdName[];
  roles?: IdName[];
};
