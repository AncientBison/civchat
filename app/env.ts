import { Opinion } from "@type/opinion";

export type CivChatSessionStorage = {
  questionId: string;
  opinion: Opinion;
  partnerOpinion: Opinion;
};

export const civChatSessionStorageKeys = [
  "questionId",
  "opinion",
  "partnerOpinion",
];

export function ensureStorageIsCivChatSessionStorage(storage: Storage) {
  return civChatSessionStorageKeys.every(
    (key) => storage.getItem(key) !== null,
  );
}
