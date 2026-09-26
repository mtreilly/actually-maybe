import assert from "node:assert/strict";
import { isPublishedPost } from "../published-posts";

assert.equal(isPublishedPost({ data: { draft: true } }), false);
assert.equal(isPublishedPost({ data: { draft: false } }), true);
assert.equal(isPublishedPost({ data: {} }), true);
console.log("Public eligibility tests passed.");
