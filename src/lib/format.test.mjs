import assert from "node:assert/strict";
import { test } from "node:test";
import { formatAddress, formatUsd } from "./format.ts";

test("formatAddress keeps short values and abbreviates long ones", () => {
  assert.equal(formatAddress("0xabc"), "0xabc");
  assert.equal(formatAddress("0x1234567890abcdef"), "0x1234...cdef");
});

test("formatUsd converts 6-decimal raw amounts", () => {
  assert.equal(formatUsd(1_500_000n), "$1.50");
  assert.equal(formatUsd(0n), "$0.00");
});
