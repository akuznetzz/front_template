import {buildDataSource, DataSource} from '~/framework/data-source';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';

export async function buildEmptyImageDataSource(
  entitySpec: IEntitySpec,
  attachFieldName: string,
  attachFieldValue: any,
  imageFieldName: string,
): Promise<DataSource> {
  const imageDataSource: DataSource = await buildDataSource(entitySpec);
  imageDataSource.fieldByName(attachFieldName).value = attachFieldValue;
  imageDataSource.fieldByName(imageFieldName).spec!.type = 'image upload';
  return imageDataSource;
}

export async function buildImageDataSource(
  entitySpec: IEntitySpec,
  id: number,
  imageFieldName = 'photo',
): Promise<DataSource> {
  const imageDataSource: DataSource = await buildDataSource(entitySpec, id);
  imageDataSource.fieldByName(imageFieldName).spec!.type = 'image upload';
  Object.assign(imageDataSource.fieldByName(imageFieldName), {
    extra: {smallPhoto: imageDataSource.fieldByName('small_photo').value?.asString()},
  });
  return imageDataSource;
}
