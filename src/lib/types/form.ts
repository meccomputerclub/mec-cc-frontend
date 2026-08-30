export type FieldType =
  | "text"
  | "number"
  | "email"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  options?: FieldOption[];
  fileAccept?: string;     // e.g. "image/*,.pdf,.doc,.docx,.zip"
  maxFileSizeMb?: number;  // e.g. 10 (MB)
}

export interface CreateFormPayload {
  title: string;
  description?: string;
  eventId: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
  fields: FormField[];
}

export interface SavedForm {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  eventId?: any;
  coverImageUrl?: string;
  fields: FormField[];
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
