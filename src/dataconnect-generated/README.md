# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListDeals*](#listdeals)
  - [*ListUsers*](#listusers)
- [**Mutations**](#mutations)
  - [*InsertAccount*](#insertaccount)
  - [*UpdateLeadStatus*](#updateleadstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListDeals
You can execute the `ListDeals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDeals(): QueryPromise<ListDealsData, undefined>;

interface ListDealsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDealsData, undefined>;
}
export const listDealsRef: ListDealsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDeals(dc: DataConnect): QueryPromise<ListDealsData, undefined>;

interface ListDealsRef {
  ...
  (dc: DataConnect): QueryRef<ListDealsData, undefined>;
}
export const listDealsRef: ListDealsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDealsRef:
```typescript
const name = listDealsRef.operationName;
console.log(name);
```

### Variables
The `ListDeals` query has no variables.
### Return Type
Recall that executing the `ListDeals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDealsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListDealsData {
  deals: ({
    id: UUIDString;
    name: string;
    amount: number;
  } & Deal_Key)[];
}
```
### Using `ListDeals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDeals } from '@dataconnect/generated';


// Call the `listDeals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDeals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDeals(dataConnect);

console.log(data.deals);

// Or, you can use the `Promise` API.
listDeals().then((response) => {
  const data = response.data;
  console.log(data.deals);
});
```

### Using `ListDeals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDealsRef } from '@dataconnect/generated';


// Call the `listDealsRef()` function to get a reference to the query.
const ref = listDealsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDealsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.deals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.deals);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    id: UUIDString;
    displayName: string;
    email: string;
  } & User_Key)[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## InsertAccount
You can execute the `InsertAccount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertAccount(): MutationPromise<InsertAccountData, undefined>;

interface InsertAccountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertAccountData, undefined>;
}
export const insertAccountRef: InsertAccountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertAccount(dc: DataConnect): MutationPromise<InsertAccountData, undefined>;

interface InsertAccountRef {
  ...
  (dc: DataConnect): MutationRef<InsertAccountData, undefined>;
}
export const insertAccountRef: InsertAccountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertAccountRef:
```typescript
const name = insertAccountRef.operationName;
console.log(name);
```

### Variables
The `InsertAccount` mutation has no variables.
### Return Type
Recall that executing the `InsertAccount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertAccountData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertAccountData {
  account_insert: Account_Key;
}
```
### Using `InsertAccount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertAccount } from '@dataconnect/generated';


// Call the `insertAccount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertAccount();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertAccount(dataConnect);

console.log(data.account_insert);

// Or, you can use the `Promise` API.
insertAccount().then((response) => {
  const data = response.data;
  console.log(data.account_insert);
});
```

### Using `InsertAccount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertAccountRef } from '@dataconnect/generated';


// Call the `insertAccountRef()` function to get a reference to the mutation.
const ref = insertAccountRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertAccountRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.account_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.account_insert);
});
```

## UpdateLeadStatus
You can execute the `UpdateLeadStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLeadStatus(vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;

interface UpdateLeadStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
}
export const updateLeadStatusRef: UpdateLeadStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLeadStatus(dc: DataConnect, vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;

interface UpdateLeadStatusRef {
  ...
  (dc: DataConnect, vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
}
export const updateLeadStatusRef: UpdateLeadStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLeadStatusRef:
```typescript
const name = updateLeadStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateLeadStatus` mutation requires an argument of type `UpdateLeadStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLeadStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateLeadStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLeadStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLeadStatusData {
  lead_update?: Lead_Key | null;
}
```
### Using `UpdateLeadStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLeadStatus, UpdateLeadStatusVariables } from '@dataconnect/generated';

// The `UpdateLeadStatus` mutation requires an argument of type `UpdateLeadStatusVariables`:
const updateLeadStatusVars: UpdateLeadStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLeadStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLeadStatus(updateLeadStatusVars);
// Variables can be defined inline as well.
const { data } = await updateLeadStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLeadStatus(dataConnect, updateLeadStatusVars);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
updateLeadStatus(updateLeadStatusVars).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

### Using `UpdateLeadStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLeadStatusRef, UpdateLeadStatusVariables } from '@dataconnect/generated';

// The `UpdateLeadStatus` mutation requires an argument of type `UpdateLeadStatusVariables`:
const updateLeadStatusVars: UpdateLeadStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLeadStatusRef()` function to get a reference to the mutation.
const ref = updateLeadStatusRef(updateLeadStatusVars);
// Variables can be defined inline as well.
const ref = updateLeadStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLeadStatusRef(dataConnect, updateLeadStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

