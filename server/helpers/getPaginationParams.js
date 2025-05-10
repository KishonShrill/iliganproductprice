// Helper function to get pagination parameters
function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
    const skip = (page - 1) * limit;
    
    // Ensure limit is positive
    const effectiveLimit = Math.max(1, limit);
    const effectiveSkip = Math.max(0, skip);

    return { page, limit: effectiveLimit, skip: effectiveSkip };
}

export default getPaginationParams;