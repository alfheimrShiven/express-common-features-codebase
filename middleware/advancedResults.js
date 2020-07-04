// MIDDLEWARE DESCRIPTION: Used for all sorts of FIND queries with operators and operations like SELECT, SORT, PAGINATION, LIMIT

const advancedResults = (model, populate) => async(req, res, next) => {
    console.log(
        'Inside advanceResults routes which offers sorting, selecting, pagination and limiting the query results'
    );
    let query;
    let reqQuery = {...req.query };
    console.log(req.query);

    // removing "select" from req.query. "Select" is used to mention the fields we want to receive back while retrieving docs. It should not be used an a key to match docs
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    // creating a copy of the query
    let queryStr = JSON.stringify(reqQuery);

    // entertaining query operators
    // adding a dollar sign (acc. to the MongoDB query format)
    var dollar_queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => {
        return '$' + match;
    });

    // framing the query
    query = model.find(JSON.parse(dollar_queryStr));

    //SELECT OPERATION
    // framing the query to just get the mentioned 'select' fields
    if (req.query.select) {
        const select_fields = req.query.select.split(',').join(' ');
        query = query.select(select_fields); // mongoose function .select(keys/fields)
    }

    // SORT OPERATION
    // framing the query to just get the mentioned 'sort' fields
    if (req.query.sort) {
        const sort_fields = req.query.sort.split(',').join(' ');
        query = query.sort(sort_fields); // mongoose function .sort (keys/fields)
    } else {
        query = query.sort('-createdAt');
    }

    //PAGINATION
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    const pagination = {};

    if (endIndex < total) {
        console.log('NEXT is there');
        pagination.next = {
            page: page + 1,
            limit,
        };
    }

    if (startIndex > 0) {
        console.log('PREV is there');
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    query = query.skip(startIndex).limit(limit);

    // Pagination
    if (populate) query = query.populate(populate);

    // Query EXECUTION
    const results = await query;

    if (!results) {
        return next(
            new ErrorResponse('Results not found with id of:' + req.params.id, 404)
        ); // accessing the error.js middleware with a new ErrorResponse obj
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results,
    };
    next();
};

module.exports = advancedResults;