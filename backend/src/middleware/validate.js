/**
 * validate(schema): generic middleware factory that validates req.body
 * (or req.query, when { source: 'query' } is passed) against a Zod schema.
 * Keeps controllers free of manual validation logic.
 */

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  req[source] = result.data; // replace with parsed/coerced data
  next();
};

module.exports = validate;
