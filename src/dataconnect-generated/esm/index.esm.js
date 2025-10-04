import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'admin',
  location: 'us-central1'
};

export const insertAccountRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InsertAccount');
}
insertAccountRef.operationName = 'InsertAccount';

export function insertAccount(dc) {
  return executeMutation(insertAccountRef(dc));
}

export const listDealsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDeals');
}
listDealsRef.operationName = 'ListDeals';

export function listDeals(dc) {
  return executeQuery(listDealsRef(dc));
}

export const updateLeadStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLeadStatus', inputVars);
}
updateLeadStatusRef.operationName = 'UpdateLeadStatus';

export function updateLeadStatus(dcOrVars, vars) {
  return executeMutation(updateLeadStatusRef(dcOrVars, vars));
}

export const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';

export function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
}

