export type Include = string;

export type Includes = Include[];

export type Exclude = string;

export type Excludes = Exclude[];

export type IncludesExcludes = {
  includes: Includes,
  excludes: Excludes,
};

export function includesToDRestUrlString(includes: Includes | undefined): string {
  return includes ? includes.map((include) => `include[]=${include}.*`).join('&') : '';
}

export function listExcludesToDRestUrlString(excludes: Excludes | undefined): string {
  if (excludes === undefined) {
    return '';
  }
  const excludesUrlString = excludes ? excludes.map((exclude) => `exclude[]=${exclude}.*`).join('&') : undefined;
  return excludesUrlString ? `exclude[]=*&${excludesUrlString}` : 'exclude[]=*';
}

export function listIncludesToDRestUrlString(includes: Includes | undefined): string {
  return includes ? includes.map((include) => `include[]=${include}`).join('&') : '';
}
