export type Nil = null | undefined

export interface Config {
  env?: { [P in string]?: string | Nil } | Nil
  import?: string | string[] | Nil
  require?: string | string[] | Nil
}
