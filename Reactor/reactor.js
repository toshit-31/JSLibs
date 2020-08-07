(function (global, factory) {
	global.Reactor = factory()
})(this, function () {
	function _isDef(obj) {
		return obj === undefined ? false : true;
	}
	function _isObj(obj) {
		return obj.constructor === Object || (obj === null)  ? true : false;
	}
	function _nodeIndex(node) {
		if(node.parentElement?.children)
			return Array.prototype.indexOf.call(node.parentElement.children, node);
	}
	function _createElmAddress(currentNode) {
		return Boolean(currentNode?.id) ?
			currentNode.localName + "#" + currentNode.id + "$" + 0 :
			currentNode.localName + "$" + _nodeIndex(currentNode);
	}
	function _readElmAddress(str) {
		var regexEl = /([a-z]{1,}(#[a-z0-9_-]{1,})?)/gi,
			regexIndex = /(\$[0-9]{1,})/gi;
		return {
			elm: regexEl.exec(str)[0],
			i: parseInt(regexIndex.exec(str)?.[0]?.split('$')[1])
		}
	}
	function _reactiveAttr(e){
		var self = this;
		var name = e.name, val = e.value;
		var attrRegex = /r:([a-z0-9\-]{1,})/gi;
		if (name.search(attrRegex) > -1) {
			self.setAttribute(name.slice(2), val)
			self.removeAttribute(name);
		}
	}
	
	$$react = {
		text : function (_val, _cursor) {
			var reactiveData = this; // the context of this is shifted to reactive data container
			try {
				var dataRegex = /{{[a-z_]{1,}[a-z0-9\$_]+}}/gmi;
				if (_val.search(dataRegex) > -1) {
					// reactive data
					var matchResult = _val.match(dataRegex);
					for (var data of matchResult) {
						data = data.substr(2, data.length - 4);
						if (!reactiveData.hasOwnProperty(data)) {
							throw data
						}
						// build text object if absent
						_isObj(reactiveData[data]) ? false : (() => {
							reactiveData[data] = {};
							reactiveData[data].texts = [];
						})();
						if (reactiveData[data].constructor !== Array) {
							reactiveData[data].texts = [];
						}
						// push the container of the reactive data 
						// into the array of the dataname in reactive data
						reactiveData[data].texts.push(_cursor.trim());
					}
					// return true if reactive text present
					return true;
				} else return false
			} catch (err) {
				console.log(err)
				//throw error if the reactive data is not defined during intialisation
				console.error('ReactorError : '+err+' referenced but not defined.')
			}
		},
		attr: function (_name, _val, _cursor) {
			var self = this;
			try {
				var dataRegex = /r:([a-z0-9\-]{1,})/gi;
				if (_name.search(dataRegex) > -1) {
					var data = dataRegex.exec(_name)[0].slice(2);
					if (!self.hasOwnProperty(_val)) {
						throw _val;
					}
					// checks if the data name key is defines in the reactive data
					_isObj(self[_val]) ? (() => {
						// check if it has attr key and if not define it
						if (!self[_val]?.attrs) {
							self[_val].attrs = {}
						}
					})() : (() => {
						// create a key with data name
						self[_val] = {};
						self[_val].attrs = {};
						})();
					// check for the data key -> attr 
					if (self[_val]?.attrs[data]?.constructor !== Array) {
						self[_val].attrs[data] = [];
					}
					self[_val].attrs[data].push(_cursor);
				}
			} catch (err) {
				//throw error if the reactive data is not defined during intialisation
				console.error('Reactor Error : '+err+' binded but not defined.')
			}
		},
		build: function (vdom, dataMut, dataOrig, watcherFn) {
			// object with no proto
			var observer = Object.create(null);
			// function to make key
			function _key(k) { return '_' + k };
			// lopp for all the mutated data in this.dataMutation
			for (var _data in dataMut) {
				if (dataMut[_data].constructor === Object) {
					// define getter and setter
					(function (data) {
						Object.defineProperty(observer, data, {
							// returns the value from original data
							get: function () {
								return dataOrig[data];
							},
							// sets the value of original data and call the watcher functions if defined
							set: function (val) {
								var oldVal = this[_key(data)];
								if (oldVal !== val) {
									//changing the value of data
									dataOrig[data] = val;
									// DOM text changes
									$updateDOM.call(dataMut, vdom, dataOrig, data)
									// add feature of watcher capabilities
									if (watcherFn && watcherFn[data] && _isDef(this[_key(data)])) {
										watcherFn[data].call(observer, val, oldVal)
									}
									this[_key(data)] = val;
								}
							}
						})
					})(_data);
					// setting the values initially
					observer[_data] = dataOrig[_data]
				}
			}
			// sealing the observer object for making it immutable by user
			return Object.seal(observer);
		}
	}

	function $updateDOM(vdom, dataOrig, dataKey) {
		// object containing address of elements
		var dataLoc = this;
		// checks the presence of texts or attrs key
		var _texts = dataLoc[dataKey]?.texts;
		var _attrs = dataLoc[dataKey]?.attrs;
		if (_texts) {
			for (var loc of _texts) {
				// current position to location
				vdom.cursorTo(loc);
				if (_isDef(vdom.cursor.$texts)) {
					for (var t of vdom.cursor.$texts) {
						var dataRegex = /{{[a-z_]{1,}[a-z0-9\$_]+}}/gmi;
						if (t.constructor === Array || Object) {
							// change the data of the text node keeping template constant
							var changedStr = t[1];
							var matchResult = t[1].match(dataRegex);
							for (var data of matchResult) {
								dataKey = data.substr(2, data.length - 4);
								changedStr = changedStr.replace(data, dataOrig[dataKey]);
								t[0].data = changedStr;
							}
						}
					}
				}
			}
		}
		if (_attrs) {
			// attr = attribute name
			for (var attr in _attrs) {
				// el = element address
				for (var el of _attrs[attr]) {
					// current position of the location
					vdom.cursorTo(el);
					// change the attribute in fom
					vdom.el.setAttribute(attr, dataOrig[data]);
					// change the value of r:attribute in vdom
					vdom.cursor.$attrs['r:'+attr] = vdom.cursor.$attrs['r:'+attr].replace('{'+dataKey+'}', dataOrig[dataKey])
				}
			}
		}
	}

	class VDOM {

		constructor(struct) {
			this.vdom = struct;
			this.cursor = this.vdom[Object.keys(this.vdom)[0]];
			this.currentLoc = [Object.keys(this.vdom)[0]];
			this.cursorName = [Object.keys(this.vdom)[0]];
			this.elName = _readElmAddress(this.cursorName.join(''))
			this.el = document.querySelectorAll(this.elName.elm)[this.elName.i];
		}

		toTop(){
			this.cursor = this.vdom[Object.keys(this.vdom)[0]]; 
			this.currentLoc = [Object.keys(this.vdom)[0]];
			this.elName = _readElmAddress(this.cursorName.join(''))
			this.el = document.querySelectorAll(this.elName.elm)[this.elName.i];
		}

		cursorBack(){
			this.currentLoc.pop();
			this.cursorTo(this.currentLoc.join(' '));
			this.getCursor();
			this.el = this.el.parentElement;
		}

		cusrorForward(childIndex) {
			var child = Object.keys(this.cursor)[childIndex];
			this.currentLoc.push(child);
			this.cursor = this.cursor[child];
			this.elName = _readElmAddress(child);
			this.el = this.el.querySelectorAll(this.elName.elm)[this.elName.i]
		}

		cursorTo(loc){
			loc = loc.split(' ');
			this.toTop();
			var i = 1;
			try {
				while (i < loc.length) {
					this.currentLoc.push(loc[i]);
					this.cursor = this.cursor.$children[loc[i]];
					this.elName = _readElmAddress(loc[i]);
					this.el = this.el.querySelectorAll(this.elName.elm)[this.elName.i]
					i++;
				}
			} catch (e) {
				return undefined;
			}
		}

		getVDOM() {
			return this.vdom;
		}

		getCursor() {
			console.log(this.currentLoc.join(' '));
			console.log(this.cursor);
			console.log(this.el);
		}

		static Location = class {
			constructor() {
				this.root;
				this.pos = [];
			}
			
			isEmpty(name) {
				if (this.location.length == 0) {
					this.root = name;
					this.pos = [this.root];
				} else this.forward(name);
			}

			forward(name) {
				this.pos.push(name)
			}
		
			back() {
				this.pos.pop();
			}
		
			get location() {
				return this.pos.join(' ').trim();
			}
		}
	}

	function _createVDOM(traverser, sel, obj, reactiveData) {
		var parentEl = sel;
		//cursor object to update recursively
		var final = {
			$attrs: {},
			$texts: null,
			$children: null,
		};
		traverser.forward(_createElmAddress(parentEl));
		// temp variables to hold values before adding to final object
		var tobj = {}, ttext = [];
		[].forEach.call(parentEl.childNodes, e => {
			if (e.constructor == Text) {
				if (e.textContent.trim().length != 0) {
					var reactiveText = $$react.text.call(reactiveData, e.textContent, traverser.location);
					// if it is reactive push the text node and template or else just text
					if (reactiveText) {
						ttext.push([e, e.textContent]);
					} else {
						ttext.push(e.textContent);
					}
				}
			} else {
				// add the child address as key to object
				var childAddr = _createElmAddress(e);
				if (final.$children == null) {
					final.$children = {};
					final.$children[childAddr] = {};
				} else {
					final.$children[childAddr] = {};
				}
			}
		});
		// attaching attributes
		var tattrs = Object.values(parentEl.attributes);
		tattrs.forEach(e => {
			tobj[e.name] = e.value;
			$$react.attr.call(reactiveData, e.name, e.value, traverser.location)
			// delete the reactive directive from attribute
			_reactiveAttr.call(parentEl, e);
		});
		Object.assign(final.$attrs, tobj);
		// attaching texts
		final.$texts = ttext;
		// add the current element key to obj
		obj[_createElmAddress(parentEl)] = final;
		// recursive call for each children
		if (final.$children != null) {
			Object.keys(final.$children).forEach(e => {
				// parse element address
				e = _readElmAddress(e);
				// recursively create vdom for child
				_createVDOM(traverser, parentEl.querySelectorAll(e.elm)[e.i], final.$children, reactiveData);
			})
			traverser.back();
		} else traverser.back();
	}

	class Reactor {
		constructor(opt) {
			this.parent = opt.wrapper;
			this.dataOriginal = opt.data;
			this.dataMutated = Object.assign({}, this.dataOriginal);
			this.watchers = opt.watch;
			this.vdom = {};
			this.loc = new VDOM.Location();
			// create a vdom
			try {
				if (this.parent.constructor == String) {
					_createVDOM(this.loc, document.querySelector(this.parent), this.vdom, this.dataMutated)
				} else {
					_createVDOM(this.loc, this.parent, this.vdom, this.dataMutated)
				}
				this.vdom = new VDOM(this.vdom);
			} catch (e) {
				console.error('ReactorError: invalid selector')
			}
			this.obs = $$react.build(this.vdom, this.dataMutated, this.dataOriginal, this.watchers);
			return this.obs
		}
	}
	return Reactor
})
