export type CustomFieldValue = {
  id: number;
  name: string;
  value: unknown;
};

export type MyAccount = {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  createdOn: Date;
  lastLoginOn?: Date;
  apiKey?: string;
  admin?: boolean;
  mailNotification?: string;
  customFields?: CustomFieldValue[];
};

export type UpdateMyAccountQuery = {
  firstname?: string;
  lastname?: string;
  mail?: string;
  customFieldValues?: Record<string, unknown>;
};
