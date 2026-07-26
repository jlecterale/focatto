// Local UI shapes for the agenda, shared between the page component and the
// useBandData hook. These mirror the cloud model in src/lib/bandTypes.ts but
// stay lightweight for rendering; the hook maps between the two.

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  youtube?: string;
  spotify?: string;
  deezer?: string;
  cifra: string; // chords in brackets, e.g. [C]
}

export interface Member {
  id: string;
  name: string;
  instrument: string;
  email: string;
  /** Linked auth uid once the invite is accepted; absent while pending. */
  uid?: string;
  /** `invited` while awaiting acceptance, `active` once linked (missing = active). */
  status?: "invited" | "active";
  role?: string;
}

export interface ScaleEvent {
  id: string;
  title: string;
  type: string; // Ensaio, Apresentação, etc.
  date: string;
  location: string;
  songs: string[]; // song ids
  members: Record<
    string,
    { memberId: string; role: string; status: "confirmado" | "pendente" | "recusado"; comment?: string }
  >;
}

export interface Indisponibilidade {
  /** Present once persisted to the cloud; absent for a freshly-created block. */
  id?: string;
  date: string; // YYYY-MM-DD
  reason: string;
}
