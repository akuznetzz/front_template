import {domainModelInjectionKey, initDomainModel} from '~/common/domain-model';

export default (context: any, inject: any) => {
  const domainModel = initDomainModel(context.app.$axios);
  inject('domainModel', domainModel);
  const mixins = context.app.mixins ?? [];
  mixins.push({
    setup() {
      provide(domainModelInjectionKey, domainModel);
    },
  });
  context.app.mixins = mixins;
};
