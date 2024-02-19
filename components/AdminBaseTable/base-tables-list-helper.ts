import {IDomainModel} from '~/framework/dbd/dbd-spec';

export async function getTablesList(domainModel: IDomainModel) {
  const entitiesList = await domainModel.getEntitiesList();
  const tablesList = await Promise.all(
    Object.keys(entitiesList).map(async (key) => {
      const entitySpec = await domainModel.getEntitySpec(key);
      return {name: key, title: entitySpec.verboseName ? entitySpec.verboseName : ''};
    }),
  );
  tablesList.sort(function (a, b) {
    return a.title > b.title ? 1 : a.title < b.title ? -1 : 0;
  });
  return tablesList;
}

export function filterTablesList(tablesList: any, searchStr?: string) {
  if (!searchStr) {
    return tablesList;
  }
  const search = searchStr.toLocaleLowerCase();
  const searchList = tablesList.filter(
    (tableInfo: any) => tableInfo.title.toLocaleLowerCase().includes(search) || tableInfo.name.includes(search),
  );
  return searchList;
}
