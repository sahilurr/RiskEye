export const asyncHandler = (requestFunction) => {
    // This will return the function without executing it
    return (req, res, next) => {
        Promise
            .resolve(requestFunction(req, res, next))
            .catch((err) => next(err))
        // if there is any error, next(error) will carry the error to the next process
        // and that error will turn into "err" as in err,req,res,next
        // using next(err), next() will skip all the non-error-handling-middlewares
        // and skip to the very next middleware which handles errors
    }
}