import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { deleteObject, listAll, ref } from "firebase/storage";
import { deleteUser, type User } from "firebase/auth";
import { db, storage } from "../firebase";

async function deleteQueryDocs(
  collectionName: string,
  field: string,
  value: string,
): Promise<void> {
  const snap = await getDocs(
    query(collection(db, collectionName), where(field, "==", value)),
  );
  await Promise.allSettled(
    snap.docs.map((d) => deleteDoc(doc(db, collectionName, d.id))),
  );
}

async function deleteStorageFolder(path: string): Promise<void> {
  const folderRef = ref(storage, path);
  const listing = await listAll(folderRef);
  await Promise.allSettled([
    ...listing.items.map((item) => deleteObject(item)),
    ...listing.prefixes.map((prefix) => deleteStorageFolder(prefix.fullPath)),
  ]);
}

/**
 * Exclui a conta do usuário e todos os dados associados, conforme exigido
 * pelas políticas da App Store (guideline 5.1.1(v)) e do Google Play
 * (política de exclusão de conta).
 *
 * A ordem importa: os dados do Firestore/Storage são removidos enquanto o
 * usuário ainda está autenticado (as regras de segurança exigem auth) e a
 * conta do Firebase Auth é excluída por último.
 *
 * Pode lançar `auth/requires-recent-login`; nesse caso o chamador deve
 * reautenticar o usuário e tentar novamente.
 */
export async function deleteUserAccount(user: User): Promise<void> {
  const uid = user.uid;

  // Dados criados pelo usuário em outras coleções (melhor esforço — as
  // regras do Firestore podem negar alguns documentos sem abortar o fluxo).
  const cleanups: Promise<void>[] = [
    deleteQueryDocs("products", "userId", uid),
    deleteQueryDocs("favorites", "userId", uid),
    deleteQueryDocs("favorites", "sellerId", uid),
    deleteQueryDocs("proposals", "senderId", uid),
    deleteQueryDocs("proposals", "receiverId", uid),
    deleteQueryDocs("notifications", "userId", uid),
    deleteQueryDocs("ratings", "userId", uid),
    deleteQueryDocs("verifications", "userId", uid),
    deleteDoc(doc(db, "teachers", uid)).catch(() => {}),
    deleteDoc(doc(db, "luthiers", uid)).catch(() => {}),
  ];
  // Chats usam array de participantes; where("participants", "==", uid) não
  // encontra nada, então tratamos separadamente com array-contains.
  cleanups.push(
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, "chats"),
          where("participants", "array-contains", uid),
        ),
      );
      await Promise.allSettled(
        snap.docs.map((d) => deleteDoc(doc(db, "chats", d.id))),
      );
    })(),
  );

  // Arquivos no Storage (avatar, fotos de produtos e de verificação).
  cleanups.push(
    deleteStorageFolder(`avatars/${uid}`).catch(() => {}),
    deleteStorageFolder(`products/${uid}`).catch(() => {}),
    deleteStorageFolder(`verifications/${uid}`).catch(() => {}),
  );

  await Promise.allSettled(cleanups);

  // Documento principal do usuário por último (regras dependem dele).
  await deleteDoc(doc(db, "users", uid)).catch(() => {});

  // Exclui a credencial do Firebase Auth. Se exigir login recente, o erro
  // sobe para o chamador reautenticar e repetir.
  await deleteUser(user);
}
