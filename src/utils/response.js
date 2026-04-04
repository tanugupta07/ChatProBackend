export function successResponse(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res, message = "Error", statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

export function notFoundResponse(res, message = "Not found") {
  return res.status(404).json({
    success: false,
    message,
  });
}
