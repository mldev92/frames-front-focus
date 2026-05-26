import type { SVGProps } from "react";

type GenderKind = "male" | "female" | "boy";

const icons: Record<GenderKind, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  male: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" fill="none" viewBox="0 0 23 24" {...props}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M10.2881 8.987h2.6667M18.104 10.4321l.4517-3.4686c.3218-2.471-1.6021-4.6617-4.0938-4.6617H8.8525c-2.4262 0-4.3294 2.082-4.112 4.4985l.327 3.6318" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M4.9207 8.7996h-.7225c-.8747 0-1.5221.8137-1.3254 1.6662l.3235 1.4014a1.3603 1.3603 0 0 0 1.3253 1.0544h.7702l.1248 1.3866c.2836 3.1514 2.9248 5.5656 6.0891 5.5656 3.0712 0 5.6658-2.2786 6.0624-5.3241l.212-1.6281h.9415a1.3602 1.3602 0 0 0 1.3253-1.0544l.3234-1.4014c.1968-.8523-.4507-1.6662-1.3253-1.6662h-.7281" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M7.0771 8.987h3.6001v1.0897c0 .9935-.8065 1.7999-1.8 1.7999-.9934 0-1.7998-.8064-1.7998-1.7999V8.9871H7.077ZM12.6382 8.987h3.6v1.0897c0 .9935-.8064 1.7999-1.7999 1.7999-.9934 0-1.7999-.8064-1.7999-1.7999V8.9871h-.0002Z" />
      <path fill="currentColor" d="M21.365 23.002c-1.0285-1.2765-2.6045-2.0933-4.3713-2.0933H6.3215c-1.767 0-3.3428.8168-4.3713 2.0933h19.415-.0002Z" />
      <path fill="currentColor" fillRule="evenodd" d="M15.4324 2.2641H7.7041c-4.7027 0-3.9474 3.85-3.4912 5.8067.6993.1877 2.272.165 2.272-1.4274s.987-2.079 1.5675-2.1232h7.0316c.5806.0442 1.5676.5307 1.5676 2.1232 0 1.5925 1.5727 1.6151 2.2719 1.4274.4562-1.9568 1.2116-5.8067-3.4911-5.8067Z" clipRule="evenodd" />
      <path fill="currentColor" d="M10.6182.5568c-3.1165 0-4.0254 1.361-4.0904 2.0415 3.5061 1.1135 10.7129 2.821 11.4921.7423C18.799 1.262 18.1678 0 17.046 0c.2818.72-2.5322.5568-6.4278.5568Z" />
    </svg>
  ),
  female: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" fill="none" viewBox="0 0 25 24" {...props}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M19.2083 14.223c-.164 3.1734-2.8397 5.6969-6.116 5.6969-3.3823 0-6.124-2.6889-6.124-6.006v-5.034" />
      <path fill="currentColor" d="M18.9684 11.5199c-.0406 1.7364-.616 5.7506-1.8433 6.8237l-.2083.3763h5.1716v-8.5673c0-3.884-3.1888-7.0327-7.1223-7.0327h-3.7554c-3.9336 0-7.1223 3.1486-7.1223 7.0327v8.5673H9.464l-.0156-.0571C7.96 17.5661 6.996 15.8133 6.996 13.8381v-4.549h5.908c2.1525 0 4.2317.043 4.6244-1.9692" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M12.5364 11.3018H9.0078v2.2217h3.5286v-2.2217ZM17.5994 11.3018h-3.5286v2.2217h3.5286v-2.2217ZM12.5312 12.2698h1.5396" />
      <path fill="currentColor" d="M22.3279 23.0399c-.9789-1.1708-2.479-1.92-4.1607-1.92H8.0089c-1.6819 0-3.1818.7492-4.1608 1.92h18.48-.0002Z" />
    </svg>
  ),
  boy: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" fill="none" viewBox="0 0 25 24" {...props}>
      <path fill="currentColor" fillRule="evenodd" d="M19.4912 9.2363c0-3.4356-1.2929-6.5964-7.2033-6.5964-5.9105 0-7.2034 3.1608-7.2034 6.5964.4925.2748 1.6623.3298 2.4011-1.6491.7388-1.979 3.5093-2.382 4.8023-2.3362 1.2929-.0459 4.0634.3573 4.8022 2.3362.7388 1.9789 1.9086 1.924 2.4011 1.649Z" clipRule="evenodd" />
      <path fill="currentColor" d="M9.5396 7.158c.289-.4905.2409-1.5672.1807-2.0442 1.445-.9812 2.89-.4088 3.4319 0-1.6257 3.2708-3.9738 2.6576-3.6126 2.0443Z" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M14.9404 14.1682c1.12 0 2.0279-.9079 2.0279-2.0278 0-1.12-.9079-2.0279-2.0279-2.0279-1.1199 0-2.0278.9079-2.0278 2.0279 0 1.1199.9079 2.0278 2.0278 2.0278ZM9.3432 14.1682c1.12 0 2.0279-.9079 2.0279-2.0278 0-1.12-.9079-2.0279-2.0279-2.0279-1.1199 0-2.0278.9079-2.0278 2.0279 0 1.1199.908 2.0278 2.0278 2.0278ZM11.3711 12.0874h1.5414" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0988" d="M19.5093 9.9322h-.4538V9.541c0-2.2207-1.8002-4.0209-4.0208-4.0209H9.2495c-2.2206 0-4.0208 1.8002-4.0208 4.0209v.3913h-.4538c-.7651 0-1.3315.7119-1.1594 1.4575l.2829 1.226a1.19 1.19 0 0 0 1.1595.9224h.284c.589 3.2207 3.4094 5.6618 6.8002 5.6618s6.2113-2.4411 6.8002-5.6618h.284a1.19 1.19 0 0 0 1.1595-.9224l.2829-1.226c.1721-.7456-.3943-1.4575-1.1594-1.4575Z" />
      <path fill="currentColor" d="M20.6342 22.0934c-.8997-1.1166-2.2784-1.8312-3.824-1.8312H7.474c-1.5458 0-2.9244.7146-3.8241 1.8312h16.9845-.0002Z" />
    </svg>
  ),
};

export function GenderIcon({ kind, className = "h-4 w-4", ...rest }: { kind: GenderKind } & SVGProps<SVGSVGElement>) {
  const Icon = icons[kind];
  return <Icon className={className} {...rest} />;
}

/** Map a Russian gender label to the icon kind. Returns null for unisex/unknown. */
export function genderToIconKind(label: string): GenderKind | null {
  const map: Record<string, GenderKind> = {
    "Мужские": "male",
    "Мужской": "male",
    "мужские": "male",
    "мужской": "male",
    "Женские": "female",
    "Женский": "female",
    "женские": "female",
    "женский": "female",
    "Детские": "boy",
    "Детский": "boy",
    "детские": "boy",
    "детский": "boy",
  };
  return map[label] ?? null;
}
