import type { Product } from "@/types";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestoreFetch(path: string, options?: RequestInit) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const url = `${BASE_URL}/${path}?key=${apiKey}`;

  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!res.ok) {
    console.error(`Firestore REST error: ${res.status}`, await res.text().catch(() => ""));
    return null;
  }

  return res.json();
}

function parseDocument(doc: any): any {
  if (!doc) return null;
  const data: Record<string, any> = {};
  const fields = doc.fields || {};
  for (const [key, value] of Object.entries(fields)) {
    const v = value as Record<string, any>;
    if (v.stringValue !== undefined) data[key] = v.stringValue;
    else if (v.integerValue !== undefined) data[key] = parseInt(v.integerValue);
    else if (v.doubleValue !== undefined) data[key] = v.doubleValue;
    else if (v.booleanValue !== undefined) data[key] = v.booleanValue;
    else if (v.timestampValue !== undefined) data[key] = new Date(v.timestampValue).getTime();
    else if (v.arrayValue?.values) data[key] = v.arrayValue.values.map((item: any) => {
      const keys = Object.keys(item);
      return item[keys[0]];
    });
    else if (v.mapValue?.fields) data[key] = parseDocument({ fields: v.mapValue.fields });
    else data[key] = null;
  }
  return { id: doc.name?.split("/").pop(), ...data };
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const result = await firestoreFetch(`products/${id}`);
    return result ? (parseDocument(result) as Product) : null;
  } catch {
    return null;
  }
}

export async function getServerProducts(category?: string): Promise<Product[]> {
  try {
    let path = "products?orderBy=createdAt&pageSize=20";
    if (category) path += `&where=category=%3D%22${category}%22`;
    const result = await firestoreFetch(path);
    if (!result?.documents) return [];
    return result.documents.map((doc: any) => parseDocument(doc) as Product).filter(Boolean);
  } catch {
    return [];
  }
}
