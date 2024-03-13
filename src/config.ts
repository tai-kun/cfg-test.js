type JsonPrimitive = string | number | boolean | null

type JsonArray = JsonValue[]

type JsonObject = { [key: string]: JsonValue }

type JsonValue = JsonPrimitive | JsonArray | JsonObject

export type Nil = null | undefined

export interface Config {
  env?: { [P in string]?: string | Nil } | Nil
  globals?: { [key: string]: JsonValue } | Nil
  import?: string | string[] | Nil
  require?: string | string[] | Nil
}
