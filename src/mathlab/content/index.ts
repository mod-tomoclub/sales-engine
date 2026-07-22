/** The authored content for Aarav's five planned units, keyed by unit id. */
import type { UnitContent } from "../types";
import { U1_HUNDREDS } from "./u1-hundreds";
import { U2_GIVE_TAKE } from "./u2-give-take";
import { U3_RAKSHA } from "./u3-raksha";
import { U4_THOUSANDS } from "./u4-thousands";
import { U5_EQUAL_GROUPS } from "./u5-equal-groups";

export const UNIT_CONTENT: Record<string, UnitContent> = {
  [U1_HUNDREDS.unitId]: U1_HUNDREDS,
  [U2_GIVE_TAKE.unitId]: U2_GIVE_TAKE,
  [U3_RAKSHA.unitId]: U3_RAKSHA,
  [U4_THOUSANDS.unitId]: U4_THOUSANDS,
  [U5_EQUAL_GROUPS.unitId]: U5_EQUAL_GROUPS,
};

export function contentFor(unitId: string): UnitContent | undefined {
  return UNIT_CONTENT[unitId];
}
