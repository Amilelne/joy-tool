function getRules(rules) {
  // rules用|分隔
  const validateRules = rules.split('|');
  const rulesObj = {};
  validateRules.forEach((rule) => {
    // rule参数用:分隔
    const specRule = rule.split(':');
    if (specRule.length > 1) {
      rulesObj[specRule[0]] = specRule[1];
    } else {
      // 没有参数的rule用true代表
      rulesObj[specRule[0]] = true;
    }
  });
  return rulesObj;
}

const validateDirective = {
  mounted(el, binding, vnode, prevVnode) {
    // 获取定义在dataset.rules的规则
    const rules = el.dataset['rules'];
    // 获取组件传递的validate函数
    const displayErrors = binding.value;
    if (!rules) return;
    // 解析rules
    const specRules = getRules(rules);
    el.addEventListener('input', (e) => {
      // input的值
      const value = e.target.value;
      let error;
      if ('email' in specRules) {
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!emailRegex.test(value)) {
          error = `字符串不符合邮件格式`;
        }
      }
      if ('minLength' in specRules) {
        if (value.length < specRules['minLength']) {
          error = `字符串长度至少为${specRules['minLength']}`;
        }
      }
      if ('required' in specRules) {
        if (!value) {
          error = '字符串不能为空';
        }
      }
      displayErrors({
        name: el.id,
        error: error,
      });
    });
  },
};

export default validateDirective;
