import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  pendingInvitesFor,
  isEmailInvited,
  isEmailOnRoster,
  nextMemberIdByUid,
  inviteBlockedReason,
} from "@/lib/bandInviteLogic";
import type { BandInvite } from "@/lib/bandTypes";

function invite(over: Partial<BandInvite>): BandInvite {
  return {
    id: "i1",
    bandId: "b1",
    bandName: "Banda",
    bandType: "ministerio",
    memberId: "m1",
    email: "player@mail.com",
    instrument: "Guitarra",
    invitedByUid: "owner",
    invitedByName: "Líder",
    status: "pending",
    createdAt: 1,
    ...over,
  };
}

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Player@Mail.COM ")).toBe("player@mail.com");
  });
});

describe("pendingInvitesFor", () => {
  it("keeps only pending invites matching the e-mail, case-insensitive", () => {
    const invites = [
      invite({ id: "a", email: "PLAYER@mail.com", status: "pending" }),
      invite({ id: "b", email: "player@mail.com", status: "accepted" }),
      invite({ id: "c", email: "other@mail.com", status: "pending" }),
    ];
    const result = pendingInvitesFor("player@mail.com", invites);
    expect(result.map((i) => i.id)).toEqual(["a"]);
  });

  it("returns empty when nothing matches", () => {
    expect(pendingInvitesFor("nobody@mail.com", [invite({})])).toEqual([]);
  });
});

describe("isEmailInvited", () => {
  it("matches ignoring case and tolerates a missing array", () => {
    expect(isEmailInvited({ invitedEmails: ["A@mail.com"] }, "a@mail.com")).toBe(true);
    expect(isEmailInvited({ invitedEmails: [] }, "a@mail.com")).toBe(false);
    expect(isEmailInvited({}, "a@mail.com")).toBe(false);
  });
});

describe("isEmailOnRoster", () => {
  it("detects an existing roster e-mail", () => {
    const members = [{ email: "Drummer@mail.com" }];
    expect(isEmailOnRoster(members, "drummer@mail.com")).toBe(true);
    expect(isEmailOnRoster(members, "new@mail.com")).toBe(false);
  });
});

describe("nextMemberIdByUid", () => {
  it("adds a link without mutating the original map", () => {
    const current = { u1: "m1" };
    const next = nextMemberIdByUid(current, "u2", "m2");
    expect(next).toEqual({ u1: "m1", u2: "m2" });
    expect(current).toEqual({ u1: "m1" });
  });

  it("handles an undefined starting map", () => {
    expect(nextMemberIdByUid(undefined, "u1", "m1")).toEqual({ u1: "m1" });
  });
});

describe("inviteBlockedReason", () => {
  const band = { invitedEmails: ["taken@mail.com"] };
  const members = [{ email: "member@mail.com" }];

  it("rejects an invalid e-mail", () => {
    expect(inviteBlockedReason(band, members, "not-an-email")).toBe("E-mail inválido.");
  });

  it("rejects an already invited e-mail", () => {
    expect(inviteBlockedReason(band, members, "TAKEN@mail.com")).toBe("Este e-mail já foi convidado.");
  });

  it("rejects an e-mail already on the roster", () => {
    expect(inviteBlockedReason(band, members, "member@mail.com")).toBe("Este e-mail já está na equipe.");
  });

  it("allows a fresh e-mail", () => {
    expect(inviteBlockedReason(band, members, "fresh@mail.com")).toBeNull();
  });
});
