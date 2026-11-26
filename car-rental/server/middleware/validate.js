// Validate req.body against a zod schema; replaces it with the parsed (typed, trimmed) data.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join('.');
    return res
      .status(400)
      .json({ success: false, message: field ? `${field}: ${issue.message}` : issue.message });
  }
  req.body = result.data;
  next();
};
