const escapeHtml = (value: string) => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const getHtmlWithLinks = (value: string) => {
  if (!value) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(value)) {
    return value;
  }

  const escapedValue = escapeHtml(value);
  const urlRegex = /(^|[\s(])((https?:\/\/|www\.)[^\s<>"']+)/gi;

  let result = '';
  let lastIndex = 0;

  for (const match of escapedValue.matchAll(urlRegex)) {
    const prefix = match[1] || '';
    const url = match[2] || '';
    const index = match.index || 0;
    const matchText = match[0] || '';
    const href = url.startsWith('www.') ? 'https://' + url : url;
    const anchor = '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';

    result += escapedValue.slice(lastIndex, index) + prefix;
    result += anchor;
    lastIndex = index + matchText.length;
  }

  result += escapedValue.slice(lastIndex);

  return result;
};

export const BaseHtml = ({ html }: { html: string }) => {
  return (
    <div
      className="whitespace-break-spaces wrap-break-word [&_a]:break-all [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80"
      dangerouslySetInnerHTML={{ __html: getHtmlWithLinks(html) }}
    />
  );
};
