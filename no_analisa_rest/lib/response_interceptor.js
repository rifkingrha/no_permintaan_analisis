module.exports = (req, res, next) => {

  res.success = (data = null, message = 'OK') => {
    res.json({
      success: true,
      message,
      data,
    });
  };

  res.error = (err, status = 500) => {
    console.error(err);
    res.status(status).json({
      success: false,
      message: err.message || err,
    });
  };

  res.notFound = (message = 'Data not found') => {
    res.status(404).json({
      success: false,
      message,
    });
  };

  next();
};