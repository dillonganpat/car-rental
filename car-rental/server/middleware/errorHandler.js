import multer from 'multer';

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' });

// Central error handler: log the real error, but never leak internals to the client.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.status === 400 || err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
};
