const sanitizeInput = (req, res, next) => {
  const sanitizeStr = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>?/gm, '').replace(/[^\\w\\s@.,-]/gi, ''); // Strip HTML and special chars
  };

  const sanitizeObj = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeStr(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObj(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObj(req.body);
  if (req.query) sanitizeObj(req.query);
  if (req.params) sanitizeObj(req.params);

  next();
};

module.exports = sanitizeInput;