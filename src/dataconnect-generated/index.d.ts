import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Account_Key {
  id: UUIDString;
  __typename?: 'Account_Key';
}

export interface Activity_Key {
  id: UUIDString;
  __typename?: 'Activity_Key';
}

export interface Deal_Key {
  id: UUIDString;
  __typename?: 'Deal_Key';
}

export interface InsertAccountData {
  account_insert: Account_Key;
}

export interface Lead_Key {
  id: UUIDString;
  __typename?: 'Lead_Key';
}

export interface ListDealsData {
  deals: ({
    id: UUIDString;
    name: string;
    amount: number;
  } & Deal_Key)[];
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    displayName: string;
    email: string;
  } & User_Key)[];
}

export interface UpdateLeadStatusData {
  lead_update?: Lead_Key | null;
}

export interface UpdateLeadStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface InsertAccountRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertAccountData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertAccountData, undefined>;
  operationName: string;
}
export const insertAccountRef: InsertAccountRef;

export function insertAccount(): MutationPromise<InsertAccountData, undefined>;
export function insertAccount(dc: DataConnect): MutationPromise<InsertAccountData, undefined>;

interface ListDealsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDealsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListDealsData, undefined>;
  operationName: string;
}
export const listDealsRef: ListDealsRef;

export function listDeals(): QueryPromise<ListDealsData, undefined>;
export function listDeals(dc: DataConnect): QueryPromise<ListDealsData, undefined>;

interface UpdateLeadStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
  operationName: string;
}
export const updateLeadStatusRef: UpdateLeadStatusRef;

export function updateLeadStatus(vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;
export function updateLeadStatus(dc: DataConnect, vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

