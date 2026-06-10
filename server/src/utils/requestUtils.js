const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 80;

export const handleServerError = (res, error, message = "Internal server error") => {
  console.error(error);
  return res.status(500).json({ message });
};

export const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), MAX_PAGE_SIZE);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const normalizeSearchQuery = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_SEARCH_LENGTH);
};

export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
