//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import * as util from '../util/util';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

	// Unit test for building a transcoded field array.
	test("Build Field Array", () => {
		let rawFieldArray =  [{
			"label":"Custom Field Name","name":"Package__Custom_Field_Name__c"
		},{
			"label":"Another Custom Name","name":"Package__Another_Custom_Field_Name__c"
		}];
		
		let newFieldArray = util.buildFieldArray(rawFieldArray);
		
		let field1 = newFieldArray[0];
		let field2 = newFieldArray[1];
		
		// resulting array is alpha-sorted on transcoded field name.
		assert.equal(field1[0], 'anotherCustomFieldName');
		assert.equal(field2[0], 'customFieldName');
	});	
	
	// Unit test for transcoding field names.
	test("Transcode Field Name", () => {
		let rawFieldName = 'Some_Package__Some_Field__c';
		let transcodedFieldName = 'someField';
		
		assert.equal(util.transcodeFieldName(rawFieldName), transcodedFieldName);
	});	

	// Unit test for transcoding data types.
	test("Transcode Data Type", () => {
		assert.equal(util.transcodeDataType('boolean'), 'Boolean');
		assert.equal(util.transcodeDataType('double'), 'Double');
		assert.equal(util.transcodeDataType('date'), 'String');
	});
	
	
	// Unit test for returning a String with it's first letter lowercased.
	test("Lower First Letter of String", () => {
		assert.equal(util.lowerFirstLetter('SimpleFieldName'), 'simpleFieldName');
	});
	
	// Unit test for returning a String with it's first letter uppercased.
	test("Upper First Letter of String", () => {
		assert.equal(util.upperFirstLetter('simpleFieldName'), 'SimpleFieldName');
	});
	
	// Unit test for checking a String for all upper case.
	test("Test For All Uppercase String", () => {
		assert.equal(util.isAllUpperCase('ALLUPPER'), true);
		assert.notEqual(util.isAllUpperCase('ThIsNoTaLlUpPeR'), true);
	});
});