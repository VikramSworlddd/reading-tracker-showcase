export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = source === 'body' ? req.body 
                 : source === 'query' ? req.query 
                 : source === 'params' ? req.params 
                 : req.body;
      
      const result = schema.parse(data);
      
      // Attach parsed/validated data back
      if (source === 'body') req.body = result;
      else if (source === 'query') req.validatedQuery = result;
      else if (source === 'params') req.validatedParams = result;
      
      next();
    } catch (err) {
      next(err);
    }
  };
}

