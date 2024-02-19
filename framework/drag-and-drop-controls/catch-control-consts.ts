export interface FileInputControlExtsDef {
  fileExts: string[];
  mimeTypes: string[];
}

export interface FileInputControlExtsDefs {
  [key: string]: FileInputControlExtsDef;
}

export const loadFileTypesDef: FileInputControlExtsDefs = {
  imageDocFile: {
    fileExts: ['jpeg', 'jpg', 'png'],
    mimeTypes: ['image/jpeg', 'image/png'],
  },
  msWordFile: {
    fileExts: ['doc', 'docx'],
    mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  pdfDocFile: {
    fileExts: ['pdf'],
    mimeTypes: ['application/pdf'],
  },
};

export function suitableTransferItem(item: DataTransferItem, suitableTypes: string[] | undefined) {
  return item.kind === 'file' && (!suitableTypes || suitableTypes.find((type) => item.type.startsWith(type)));
}
