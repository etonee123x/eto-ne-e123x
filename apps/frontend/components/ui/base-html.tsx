'use client';

import { useRouter } from "@/i18n/navigation";

export const BaseHtml = ({ html }: { html: string }) => {
  const router = useRouter();

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {

    if (!(event.target instanceof HTMLAnchorElement)) {
      return;
    }

    if (!event.target.href || event.target.target === '_blank') {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    router.push(event.target.href.replace(globalThis.origin, ''));
  };

  return <div className="custom-html" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
}

