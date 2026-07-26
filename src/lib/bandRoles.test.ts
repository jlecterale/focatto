import { describe, it, expect } from "vitest";
import { isBandLeader, isBandOwner, roleOf, roleLabel, toggleLeader } from "@/lib/bandRoles";

const band = { ownerId: "owner", leaderUids: ["owner", "co"] };

describe("isBandLeader", () => {
  it("recognises owner and co-leaders, rejects plain members and nulls", () => {
    expect(isBandLeader(band, "owner")).toBe(true);
    expect(isBandLeader(band, "co")).toBe(true);
    expect(isBandLeader(band, "musician")).toBe(false);
    expect(isBandLeader(band, null)).toBe(false);
  });

  it("treats a missing leaderUids as owner-only", () => {
    expect(isBandLeader({ ownerId: "owner" }, "owner")).toBe(true);
    expect(isBandLeader({ ownerId: "owner" }, "co")).toBe(false);
  });
});

describe("isBandOwner", () => {
  it("is true only for the owner", () => {
    expect(isBandOwner(band, "owner")).toBe(true);
    expect(isBandOwner(band, "co")).toBe(false);
  });
});

describe("roleOf / roleLabel", () => {
  it("maps uids to roles and pt-BR labels", () => {
    expect(roleOf(band, "co")).toBe("leader");
    expect(roleOf(band, "musician")).toBe("member");
    expect(roleLabel(band, "owner")).toBe("Líder");
    expect(roleLabel(band, "co")).toBe("Co-líder");
    expect(roleLabel(band, "musician")).toBe("Músico");
  });
});

describe("toggleLeader", () => {
  it("promotes a musician while always keeping the owner", () => {
    const next = toggleLeader({ ownerId: "owner", leaderUids: ["owner"] }, "musician", true);
    expect(next).toContain("owner");
    expect(next).toContain("musician");
  });

  it("demotes a co-leader but never removes the owner", () => {
    expect(toggleLeader(band, "co", false)).toEqual(["owner"]);
    expect(toggleLeader(band, "owner", false)).toContain("owner");
  });

  it("does not duplicate an already-present leader", () => {
    const next = toggleLeader(band, "co", true);
    expect(next.filter((u) => u === "co")).toHaveLength(1);
  });
});
