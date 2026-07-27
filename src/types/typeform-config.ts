/** Field type identifiers for typeform config entries. */
export type TypeformFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'file_upload'
  | 'file'
  | 'team_members'
  | 'date'
  | 'url'
  | (string & {}); // allow arbitrary strings while keeping autocomplete

/**
 * Describes a single field inside an event's `typeform_config` JSON column.
 *
 * The config drives how registration details are displayed in the admin panel
 * (labels, visibility, file handling, team-member detection, etc.).
 */
export interface TypeformFieldConfig {
  /** Unique field identifier – must match the key stored in `registration.details`. */
  id: string;

  /** Human-readable label shown in the admin UI. */
  label: string;

  /** Semantic type of the field (controls rendering logic). */
  type?: TypeformFieldType;

  /** If `true`, the field is omitted from the admin detail view. */
  hidden?: boolean;

  /** If `true`, this field's value is used as the display name for team entries. */
  isTeamName?: boolean;

  /** If `true`, this field contains the team-members array. */
  isTeamMembers?: boolean;

  /** Whether the field is required during registration. */
  required?: boolean;

  /** Available options for select / multiselect fields. */
  options?: string[];

  /**
   * Supabase Storage bucket to use when constructing download URLs for
   * file-upload fields.  Falls back to `"registrations"` when omitted.
   */
  bucketName?: string;
}
