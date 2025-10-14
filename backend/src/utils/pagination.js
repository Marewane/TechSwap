// @desc    Pagination utility for consistent pagination across the app
// @param   {Object} query - MongoDB query object
// @param   {Object} options - Pagination options
// @returns {Object} Pagination metadata and results

const paginate = async (model, query = {}, options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = { createdAt: -1 },
            select = '',
            populate = ''
        } = options;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100 for performance
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination
        const [results, total] = await Promise.all([
            model.find(query)
                .select(select)
                .populate(populate)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(), // Convert to plain objects for better performance
            model.countDocuments(query)
        ]);

        const pages = Math.ceil(total / limitNum);
        const hasNext = pageNum < pages;
        const hasPrev = pageNum > 1;

        return {
            results,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages,
                hasNext,
                hasPrev,
                nextPage: hasNext ? pageNum + 1 : null,
                prevPage: hasPrev ? pageNum - 1 : null
            }
        };
    } catch (error) {
        console.error('Pagination error:', error);
        throw new Error('Pagination failed: ' + error.message);
    }
};

// @desc    Build pagination response object
const buildPaginationResponse = (data, pagination, message = '') => {
    return {
        success: true,
        data,
        pagination,
        ...(message && { message })
    };
};

module.exports = {
    paginate,
    buildPaginationResponse
};