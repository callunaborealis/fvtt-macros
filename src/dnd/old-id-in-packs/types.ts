type FileName = string;
type DatumKey = string;
type DatumId = string;
// "character" | "feat" | "npc"
type DataType = string;
type Datum = Record<"name", string> &
  Record<"_id", DatumId> &
  Record<"type", DataType> &
  Record<string, any>;

export type { Datum, DatumId, DataType, DatumKey, FileName };
