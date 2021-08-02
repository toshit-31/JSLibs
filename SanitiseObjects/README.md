# Validation

### Parameter `Object`
  
  __Example__
  ```javascript
   // The key in the json as input should be an array of numbers less than 100
   // or the function will throw an error for not validating
   {
   type: Array,
   required: true,
   element: Number,
   validation: (arr) => arr.every(n => n < 100) 
   }
  ```

### __Keys__

- __`type`__ - data format in the final json

  Accepted Values : `String`, `Number`, `Array`, `Object`

- __`required`__ - set to `true` if the key is required

- __`validation`__ - function to validate input value, must return a `boolean`

- __`element`__ - accepts a data format value when `type` is set to `Array` to check if all the elements of array belong to the particular data type

### Return `Function`

  The returned function accepts the object to be santisied and validated as parameter and returns the validated object 

#### Example
 
```javascript

let validRules = {
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String
  },
  roll_num: {
    type: Number,
    required: true,
    validation: (n) => n < 100
  }
}

let obj = {
  first_name: "Toshit",
  roll_num: 76
}

let validFn = validator(validRule);
let result = validFn(obj)

console.log(result)
// {name: "Toshit",
//  roll_num: 76}
```
