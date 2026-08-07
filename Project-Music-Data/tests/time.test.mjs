import test from "node:test";
import assert from "node:assert";
import { getDay } from "../src/utils/time.mjs";

test("getDay returns local date string", () => {
  const ts = new Date("2026-01-22T01:23:45").getTime();
  const dayStr = getDay(ts);
  assert.match(dayStr, /^\d{4}-\d{2}-\d{2}$/);
});
