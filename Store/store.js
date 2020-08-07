"use strict";

(function(global){

    const util = {
        // returns true if obj has prop property
        hasProp(obj, prop){
            return obj.hasOwnProperty(prop) 
        },
        // set state 
        setState(uid, newState){
            stateMapper[uid] = newState;
        }
    };

    var stateMapper = {};
    var key = 0;
    
    /**
     * 
     * @param {object} initState
     */
    function Store(initState){
        this._uid = key++;
        // maps subscribers
        this._subs = {};
        // maps actions
        this._actions = {};
        // set initial state object if provided or empty object
        stateMapper[this._uid] = (initState || {});
    }

    /**
     * @returns {object}
     */
    Store.prototype.getState = function(){
        return stateMapper[this._uid];
    }

    /**
     * @param {string} actionType
     * @param {function} fn
     */
    Store.prototype.defineAction = function(actionType, fn){
        this._actions[actionType] = fn;
    }

    /**
     * @param {string} actionType
     * 
     */
    Store.prototype.subscribe = function(actionType, fn){
        this._subs[actionType] = fn;
    }

    /**
     * @param {string} actionType
     * @param {object} newState
     */
    Store.prototype.dispatchAction = function(actionType, newState){
        if (!util.hasProp(this._actions, actionType))
            throw ReferenceError(`action:${actionType} is not defined`);
        var tempOldState = this.getState();
        // call the action associated with action type
        // first-param : old state
        // second-param : new object
        //returns : new state
        var mutatedState = this._actions[actionType].call(null, tempOldState, newState);
        // set the new state from the return object
        util.setState(this._uid, (mutatedState || {}));
        // call the subscriber to the action type if defined
        util.hasProp(this._subs, actionType) ? this._subs[actionType].call(null, mutatedState) : false;
    }

    global.Store = Store;
}(globalThis));