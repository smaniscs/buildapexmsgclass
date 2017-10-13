import * as vscode from 'vscode';
import * as path from 'path';

/**
   Builds a multi-dimensional array, where the first element in each
	row is the camel-cased field name (minus any package prefix), the second element 
	is the raw/unaltered Salesforce field name, and the third element is all the metadata 
	about the field.
  */
export function buildFieldArray(fields) {
  var fieldArray = new Array()
  var innerArray = null

  fields.forEach((field, index, fields) => {
	// omit any field which is not updateable.
	if (field.updateable === false && field.name != 'Id') {
	  console.log('updateable == false on field ' + field.name + ', skipping.');
	  return
	}

	innerArray =  new Array()
	// Id gets mapped to 'recordId'.
	if (field.name.toLowerCase() === 'id') {
	  innerArray.push('recordId');
	}
	else {
	  innerArray.push(transcodeFieldName(field.name))
	}
	innerArray.push(field.name)
	innerArray.push(field)

	fieldArray.push(innerArray)
   })

  // Alpha sort on the friendly field name.
  fieldArray.sort((a,b ) => {
	if (a[0] === b[0]) {
		return 0;
	}
	else {
	  return (a[0] < b[0]) ? -1 : 1;
	}
  })

  return fieldArray
}



/*
  Transcodes Salesforce field names to a camel-case format, stripping any prefixed  
  package name which is delimited by a double underscore.
*/
export function transcodeFieldName(field) {

  field = field.replace('__c', '')

  // If a package name is prefixed to the field name, discard it.
  let pos = field.indexOf('__')
  if (pos > -1) {
	field = field.substring(pos+2);
  }
  
  let nameParts = field.split('_');
  let camelCaseName = '';

  nameParts.forEach((part, index, parts) => {
	// if all letters after the first are uppercase,  go ahead and lowercase the whole field name.  This handles
	// the case where a field named like "GUID__c"" would end up being named "gUID".
	if (isAllUpperCase(part)) {
	  part = part.toLowerCase()
	}
	else {
	  part = lowerFirstLetter(part)
	}
	
	if (index == 0) {
	  camelCaseName += part;
	}
	else {
	  camelCaseName += upperFirstLetter(part)
	}
  })	 

  return camelCaseName
}



/*
  Transcodes a Salesforce data type into an appropriate data type.  The default assumed type
  is String, which works for most cases.  Only datatype overrides are configured here, i.e. Double,
  Boolean, etc.
*/
export function transcodeDataType(dataType) {
  dataType = dataType.toLowerCase()

  var returnType = 'String'

  if (dataType == 'boolean') {
	returnType = 'Boolean'
  }
  else if (dataType == 'double') {
	returnType = 'Double'
  }
  return returnType
}


/**
   Convenience method to lowercase the first byte of any String value. 
 */
export function lowerFirstLetter(s) {
  return s.substr(0, 1).toLowerCase() + s.substr(1)
}

/**
   Convenience method to uppercase the first byte of any String value. 
 */

export function upperFirstLetter(s) {
  return s.substr(0,1).toUpperCase() + s.substr(1)
}


export function isAllUpperCase(s) {
   return s === s.toUpperCase()
}

export function loadConfig() {
	// Look for force.json config file.
	return vscode.workspace.findFiles('**/force.json')
	.then(result => {
		if (result.length == 0) {
			return Promise.reject('Can\'t find a "force.json" file in the root of your project.');
		}
		return result;
	})
	.then(result => {
		return vscode.workspace.openTextDocument(result[0])
		.then(textDocument => {
			let result = null;
			let config = JSON.parse(textDocument.getText());
			if (!config.username) { 
				vscode.window.showErrorMessage('No value for "username" is set in "force.json".');
			}
			else if (!config.password) {
				vscode.window.showErrorMessage('No value for "password" is set in "force.json".');
			}
			else if (!config.url) {
				vscode.window.showErrorMessage('No value for "url" is set in "force.json".');
			}
			else if (!config.apiVersion) {
				vscode.window.showErrorMessage('No value for "apiVersion" is set in "force.json".');
			}
			else {
				result = config;
			}
			return result;
		});
	});
}

export function listSobjects(result) {
	let sobjArray = new Array();
	let sobj = null;

	// Build an array of Sobjects,  skipping any object that can't be modified in any way.
	for (var i = 0; i < result.sobjects.length; i++) {
		sobj = result.sobjects[i];
		// skip non updateable objects
		if (!(sobj.createable || sobj.deletable || sobj.updateable)) {
			continue;
		}
		sobjArray.push(sobj.name);
	}
	
	return vscode.window.showQuickPick(sobjArray.sort());
}