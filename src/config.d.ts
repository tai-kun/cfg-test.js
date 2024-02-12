type Nullable = null | undefined;

export interface Config {
  env?: { [P in string]?: string | Nullable } | Nullable;
  import?: string | string[] | Nullable;
  require?: string | string[] | Nullable;
}
