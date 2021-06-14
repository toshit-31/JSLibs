const validator = function(rule){
  let _keys = Object.keys(rule);
  let reqKeys = [];
  _keys.forEach( k => {
    if(!!rule[k].required) reqKeys.push(k)
  })
  return function(obj){
    let validated = {};
    // check if all required keys are present
    reqKeys.forEach( k => {
      if(!obj[k]) throw new Error(`RequiredKeyMissing : '${k}'`);
    })
    // populating the validated object
    _keys.forEach(k => {
      // if key is not present in objected then value is set to empty String
      if(!obj[k]) {
        obj[k] = ""
        return
      };
      let val = obj[k];
      let formatedVal;
      if(!rule[k].type){ 
        formatedVal = val;
      } else {
        const dtype = rule[k].type;
        switch(dtype){
          case String: {
            formatedVal = new String(val).toString();
            break;
          }
          case Number: {
            if(isNaN(parseFloat(val))) throw new Error(`InvalidValue : ${k} cannot be parsed to number`);
            if(parseInt(val) == Math.ceil(parseFloat(val))) formatedVal = parseInt(val);
            else formatedVal = parseFloat(val);
            break;
          }
          case Array: {
            if(obj[k].constructor != Array) throw new Error(`InvalidValue : ${k} expects an array`);
            if(!rule[k].element) {
              formatedVal = val;
            } else {
              let validArray = val.every( e => {
                return e.constructor == rule[k].element
              })
              if(validArray){
                formatedVal = val;
              } else throw new Error("InvalidArray : "+k);
            }
            break
          }
          case Object: {
            if(obj[k].constructor != Object) throw new Error(`InvalidValue : ${k} expects a object`);
            formatedVal = val;
            break
          }
          default: throw new Error("UndefinedError")
        } 
      }
      // formatedVal is defined by this point
      if(rule[k].validation){
        if(!rule[k].validation.call(null, val)) throw new Error("ValidationError : "+k);
      }
      validated[k] = formatedVal;
    })
    return validated
  }
}

module.exports = validator;
