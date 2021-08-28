const newEnforcer = require('casbin');

const enforcer = await newEnforcer('casbin_config/basic_model.conf', 'casbin_config/basic_policy.csv');

const sub = 'Administrator';
const obj = '*';
const act = 'GET';

const res = await enforcer.enforce(sub, obj, act);







