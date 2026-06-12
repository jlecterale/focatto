// Utilidades de SEO usadas pelos server components (generateMetadata, sitemap).
//
// As páginas de anúncio/vendedor são client components que buscam dados no
// browser; para que buscadores e previews sociais (WhatsApp, etc.) enxerguem
// título/descrição/imagem, os metadados são resolvidos no servidor via API
// REST do Firestore — as regras já permitem leitura pública desses documentos.

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "focatto";

// Defina NEXT_PUBLIC_SITE_URL no ambiente de deploy com o domínio público real.
// Normaliza o valor (protocolo ausente, URL inválida) para nunca lançar em
// build/runtime — `new URL()` com valor malformado quebraria o app inteiro.
const DEFAULT_SITE_URL = "https://focatto.firebaseapp.com";

function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim();
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values?: FirestoreValue[] };
}

interface FirestoreDocument {
  name?: string;
  fields?: Record<string, FirestoreValue>;
}

function str(field?: FirestoreValue): string {
  return field?.stringValue || "";
}

function firstArrayString(field?: FirestoreValue): string {
  return field?.arrayValue?.values?.[0]?.stringValue || "";
}

async function fetchPublicDoc(path: string): Promise<FirestoreDocument | null> {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as FirestoreDocument;
  } catch {
    return null;
  }
}

export interface ProductSeoData {
  title: string;
  description: string;
  photo: string;
  city: string;
  state: string;
  price: number | null;
}

export async function fetchProductSeoData(productId: string): Promise<ProductSeoData | null> {
  const docData = await fetchPublicDoc(`products/${encodeURIComponent(productId)}`);
  const fields = docData?.fields;
  if (!fields || !str(fields.title)) return null;
  const priceField = fields.price;
  const price = priceField?.doubleValue ?? (priceField?.integerValue ? Number(priceField.integerValue) : null);
  return {
    title: str(fields.title),
    description: str(fields.description),
    photo: firstArrayString(fields.photos),
    city: str(fields.city),
    state: str(fields.state),
    price,
  };
}

export interface SellerSeoData {
  displayName: string;
  bio: string;
  photoURL: string;
}

export async function fetchSellerSeoData(sellerId: string): Promise<SellerSeoData | null> {
  const docData = await fetchPublicDoc(`users/${encodeURIComponent(sellerId)}`);
  const fields = docData?.fields;
  if (!fields || !str(fields.displayName)) return null;
  return {
    displayName: str(fields.displayName),
    bio: str(fields.bio),
    photoURL: str(fields.photoURL),
  };
}

// Lista ids de produtos aprovados via runQuery público (usado no sitemap).
export async function fetchApprovedProductIds(max = 1000): Promise<string[]> {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "products" }],
            // Projeção apenas do nome do documento: o sitemap só precisa dos IDs.
            select: { fields: [{ fieldPath: "__name__" }] },
            where: {
              fieldFilter: {
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "approved" },
              },
            },
            limit: max,
          },
        }),
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ document?: { name?: string } }>;
    return rows
      .map((row) => row.document?.name?.split("/").pop() || "")
      .filter(Boolean);
  } catch {
    return [];
  }
}
