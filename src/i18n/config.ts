export type Language = "en" | "my";

export const defaultLanguage: Language = "en";

export const supportedLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာစာ" },
];
