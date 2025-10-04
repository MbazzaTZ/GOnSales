const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'admin',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const insertAccountRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InsertAccount');
}
insertAccountRef.operationName = 'InsertAccount';
exports.insertAccountRef = insertAccountRef;

exports.insertAccount = function insertAccount(dc) {
  return executeMutation(insertAccountRef(dc));
};

const listDealsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDeals');
}
listDealsRef.operationName = 'ListDeals';
exports.listDealsRef = listDealsRef;

exports.listDeals = function listDeals(dc) {
  return executeQuery(listDealsRef(dc));
};

const updateLeadStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLeadStatus', inputVars);
}
updateLeadStatusRef.operationName = 'UpdateLeadStatus';
exports.updateLeadStatusRef = updateLeadStatusRef;

exports.updateLeadStatus = function updateLeadStatus(dcOrVars, vars) {
  return executeMutation(updateLeadStatusRef(dcOrVars, vars));
};

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
};
