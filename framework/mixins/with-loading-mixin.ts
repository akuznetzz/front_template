import {delay} from '~/framework/utils/delay-promise';

type Constructor = new (...args: any[]) => {};

export function WithLoadingMixin<TBase extends Constructor>(Base: TBase) {
  return class WithLoading extends Base {
    _loaded: boolean = false;
    _loading: boolean = false;

    async withLoading(callback: () => Promise<void>): Promise<void> {
      if (this._loaded) return;
      if (this._loading) {
        while (this._loading)
          await delay(200);
        return;
      }

      this._loading = true;
      try {
        await callback();
        this._loaded = true;
      } finally {
        this._loading = false;
      }
    }
  };
}
