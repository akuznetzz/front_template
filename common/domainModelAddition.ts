
export function domainModelAddition(entityName: string) {
  const domainModelPermission = new Map([
    ['persons', {canAdd: true, canEdit: true}],
  ]);

  return domainModelPermission.get(entityName);
}
