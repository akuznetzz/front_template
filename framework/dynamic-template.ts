// @ts-ignore
import VueWithCompiler from 'vue/dist/vue.esm';

let templateRender: any;

export default defineComponent({
  props: {
    strBody: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const root = getCurrentInstance().proxy;
    const compiled = VueWithCompiler.compile(`<div>${props.strBody}</div>`);
    templateRender = compiled.render;
    root.$options.staticRenderFns = [];
    for (const staticRenderFunction of compiled.staticRenderFns) {
      root.$options.staticRenderFns.push(staticRenderFunction);
    }
  },
  render(): any {
    if (templateRender) {
      return templateRender.call(this);
    } else {
      return h('div', 'Загрузка шаблона');
    }
  },
});
