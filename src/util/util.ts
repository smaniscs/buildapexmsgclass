import * as vscode from 'vscode';
import * as path from 'path';

/**
	Builds a multi-dimensional array, where the first element in each
	row is the camel-cased field name (minus any package prefix), the second element 
	is the raw/unaltered Salesforce field name, and the third element is all the metadata 
	about the field.
	@param fields The raw results from a JSForce describe('sObjectName') call.
	@returns The multi-dimensional array of sObject field data.
  */
export function buildFieldArray(fields) {
  var fieldArray = new Array();
  var innerArray = null;

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
	  innerArray.push(transcodeFieldName(field.name));
	}
	innerArray.push(field.name);
	innerArray.push(field);

	fieldArray.push(innerArray);
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

  return fieldArray;
}



/**
	Transcodes Salesforce field names to a camel-case format, stripping any prefixed  
	package name which is delimited by a double underscore.
	@param A raw field name from the target sObject.
	@returns The sObject field name transcoded into a javascript-friendly camelcase field name.
*/
export function transcodeFieldName(field) {

	field = field.replace('__c', '');

	// If a package name is prefixed to the field name, discard it.
	let pos = field.indexOf('__');
	if (pos > -1) {
		field = field.substring(pos+2);
	}

	let nameParts = field.split('_');
	let camelCaseName = '';

	nameParts.forEach((part, index, parts) => {
		// if all letters after the first are uppercase,  go ahead and lowercase the whole field name.  This handles
		// the case where a field named like "GUID__c"" would end up being named "gUID".
		if (isAllUpperCase(part)) {
			part = part.toLowerCase();
		}
		else {
			// handle the case where a field name part is 'SLAViolation', where you need to 
			// convert it to 'slaViolation'.
			let lastUpperPos = startsWithMoreThanTwoUpperCase(part);
			if (lastUpperPos == -1) {
				part = lowerFirstLetter(part);
			}
			else {
				part = multipleUpperToCamel(part, lastUpperPos);
			}
		}
		
		if (index == 0) {
		camelCaseName += part;
		}
		else {
		camelCaseName += upperFirstLetter(part);
		}
	})

	return camelCaseName;
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

/** 
 * Figures out if the target string starts with more than two uppercase character and returns
 * the index of the last uppercase character.
 * @returns numeric The index of the last uppercase character found in the target string, or -1 if 
 *   no uppercase characters found, the string start with a lowercase char, or starts with two or less
 *   uppercase characters..
 */
export function startsWithMoreThanTwoUpperCase(str) {
	if (str.substring(0,1) != str.substring(0,1).toUpperCase()) {
		return -1.
	}
	
	let result = -1;
	let chars = str.split('');
	let hasMultipleUpperCase = false;
	let char = null;
	let upperCount = 1;
	
	// note we start with index 1, where 
	for (var i = 1; i < chars.length-1; i++) {
		char = str.substring(i, i+1);
		if (char == char.toUpperCase()) {
			hasMultipleUpperCase = true;
			upperCount++;
		}
		else {
			result = i-1;
			break;	
		}		
	}
	// There has to be at least 2 uppercase characters, else we don't care.
	if (upperCount <= 2) {
		result = -1;
	}
	return result;
}

/**
 * Converts a string with starts with more than two uppercase characters into 
 * camel-case.  e.g.,  'SLAViolation' becomes 'slaViolation'.
 * @param str The target string to be camel-cased.
 * @param lastUpperPos The index of the last  uppercase char in the string.
 * @returns A camel-cased string.
 * @see startsWithMoreThanTwoUpperCase
 */
export function multipleUpperToCamel(str, lastUpperIndex) {
	let chars = str.split('');
	let result = '';
	
	for (var i = 0; i < str.length; i++) {
		if (i == lastUpperIndex) {
			result += str.slice(i);
			break;
		}
		result += str.charAt(i).toLowerCase();
	}
	return result;
}

/**
 * Loads the force.json config file, where this file is expected to be in the root of your project. 
 */
export function loadConfig() {
	// Look for force.json config file.
	return vscode.workspace.findFiles('**/force.json')
	.then(result => {
		if (!result || result.length == 0) {
			return Promise.reject('Can\'t find a "force.json" file in the root of your project.');
		}
		return result;
	})
	.then(result => {
		return vscode.workspace.openTextDocument(result[0]);
	})
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
	
	return vscode.window.showQuickPick(sobjArray.sort(), {placeHolder: 'Select an sObject or ESC to cancel.'});
}