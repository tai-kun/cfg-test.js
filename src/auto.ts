import { readFileSync } from "node:fs"
import { join } from "node:path"
import { cwd } from "node:process"
import { register } from "./api"

const pkgJsonPath = join(cwd(), "package.json")
const pkgJson = readFileSync(pkgJsonPath, "utf8")
const pkg = JSON.parse(pkgJson)

register({
  pkg,
  auto: true,
})
