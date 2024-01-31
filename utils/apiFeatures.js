/* eslint-disable max-len */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString }; // to make a hard copy not a refernce  {obj=req.query create a refernce }

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj); // cast the object to a string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // \b to get the same world without any characters before it or after it // g for getting more than one operator if there is

    // this is what it should looklike to deal withit{ difficulty: 'easy', duration: { '$gte': '5' } }
    this.query = this.query.find(JSON.parse(queryStr)); // JSON.parse cast the string to an object
    return this; // the entire object
  }

  sort() {
    // 2) Sorting

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // -price => sort desc  price =>sort  asc
      // sort('price average name')// it sort first by price sencond by average etc... we do the split join to match the function and because we can't add space in url
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      // select('price average name')
    } else {
      this.query = this.query.select('-__v'); // every thing except __v (this becuase we prefix it with minus)
    }
    return this;
  }

  paginate() {
    // 4)pagination
    const limit = this.queryString.limit || 100; // number of documents per page
    const page = this.queryString.page || 1; // the number of the page client need
    const skip = (page - 1) * limit; // number of documents skipped before the data you need
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
