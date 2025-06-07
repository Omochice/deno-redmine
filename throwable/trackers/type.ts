import { IdName } from "../../internal/type.ts";

export type Tracker = {
  id: number;
  name: string;
  defaultStatus: IdName;
  description?: string;
};
