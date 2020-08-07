# Store.js
![Generic Badge](https://img.shields.io/badge/Author-Toshit-brightgreen)
![Generic Badge](https://img.shields.io/badge/Size-2KB-yellow)

### Create a store
* Parameter:<br>
  `initState` - intial state data
```javascript
// new Store(initState)
var store = new Store({
  "key1": "value1",
  "key2": "value2"
})
```
  * Note: If no parameter is provided to `Store` constructor an empty object is used as a state data
  
### Define an action
* Parameters:<br>
  `state` - current state data<br>
  `newData` - data to update state with

```javascript
// store.defineAction(actionType, fn)
store.defineAction("action1", function(state, newData){
  // processing of new data 
  return {...}
})
```
  * Object returned is set as new state, if no return statement is provided state data does not mutate
  * To avoid complete overwrite of the state data, follow: 
  ```javascript
  store.defineAction("action1", function(state, newData){
    // processing of new data 
    return {...state, ...newData}
  }
  ```
  
### Subscribe to action
* Parameter:<br>
  `state` - state data after action is performed and new state returned

```javascript
// store.defineAction(actionType, fn)
store.subscribe("action1", function(state){
  // code
})
```

### Fire an action
```javascript
// store.dispatchAction(actionType, data)
store.dispatchAction("action1", {"key2": "value2", "key3":"value3"})
```

### Get current state data
```javascript
store.getState(); // returns an object 
```
