/** A value as it can appear inside a parsed Lua table literal (WoW SavedVariables shape). */
export type LuaValue = string | number | boolean | null | LuaValue[] | LuaTable

export interface LuaTable {
  [key: string]: LuaValue
}

export function isLuaTable(value: LuaValue | undefined): value is LuaTable {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isLuaArray(value: LuaValue | undefined): value is LuaValue[] {
  return Array.isArray(value)
}
