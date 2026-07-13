export type User = {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  createdOn: Date;
  updatedOn?: Date;
  lastLoginOn?: Date;
  admin?: boolean;
  apiKey?: string;
  status?: number;
};

export type CreateUserQuery = {
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  password?: string;
  authSourceId?: number;
  mailNotification?: string;
  mustChangePasswd?: boolean;
  generatePassword?: boolean;
  status?: number;
  admin?: boolean;
};

export type UpdateUserQuery = Partial<CreateUserQuery>;
