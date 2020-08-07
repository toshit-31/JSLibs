# Reactor
Reactor is JavaScript library for bringing reactivity to your DOM. 
It updates the DOM where the provided data is binded with attribute or within the text.
- Inside the text, the reactive data is placed within double curly braces 
```
<span>Name : {{firstName}}</span>
```
- Attributes are made reactive by using a prefix ```r:``` before the attribute name, Ex.
```
<span r:data-name= "firstName"></span>
```

### Instance of Reactor
```
var r = new Reactor({
  wrapper : '#_reactor',
  data : {
    firstName : 'Toshit',
    lastName : 'Mall',
    age: 19
  }
})
```
- The Reactor class returns a object which sets or gets the value of the data provided during initialising
- The wrapper options accepts a `string `CSS-Selector or a `HTMLElement` object as its value
- The data accepts key and value pairs for storing data
- The watcher function for corresponding data is called as follows:
  ```
  ...
  watcher: {
    age: function(newVal, oldVal){
      // statement 
    }
  ...
  ```
