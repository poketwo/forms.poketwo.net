import { Form } from "@formium/types";

export const getFirstPageFieldSlugs = (form: Form): Set<string> => {
  const schema = form.schema;
  if (!schema?.pageIds?.length) return new Set();

  const firstPageId = schema.pageIds[0];
  const firstPage = schema.fields[firstPageId];
  if (!firstPage?.items) return new Set();

  return new Set(
    firstPage.items
      .map((id) => schema.fields[id]?.slug)
      .filter((slug): slug is string => !!slug)
  );
};
