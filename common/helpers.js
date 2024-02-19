export default {
  processQueryFilter(query, filter) {
    if (filter.id) {
      query = query + '/' + filter.id;
    }
    query = query + '?';
    if (filter.filters.length > 0) {
      filter.filters.forEach((item) => {
        if (item.keyword) {
          query = query + '&filter{' + item.field + '.icontains}=' + item.keyword;
        } else if (item.value) {
          query = query + '&filter{' + item.field + '}=' + item.value;
        }
      });
    }
    return query;
  },
};
