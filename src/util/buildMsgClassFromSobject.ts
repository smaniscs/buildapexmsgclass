import * as vscode from 'vscode';
import * as fs from 'fs';
import * as util from './util';
import * as path from 'path';

export function buildMessageClass(conn, sobjName) {
	const PRETTY_FIELD_NAME = 0;
	const RAW_FIELD_NAME = 1;
	const FIELD_METADATA = 2;
	const INDENT1 = '\t';
	const INDENT2 = '\t\t';
	const INDENT3 = '\t\t\t';
	const INDENT4 = '\t\t\t\t';
	const SOBJECT_FIRST_LETTER = sobjName.charAt(0).toLowerCase();
		
	const APEX_CLASS_NAME = util.upperFirstLetter(util.transcodeFieldName(sobjName) + 'Msg');	
	const OUTPUT_FILE = vscode.workspace.rootPath + path.sep + 'src' + path.sep + 'classes' + path.sep + APEX_CLASS_NAME+'.cls';
	const ws = fs.createWriteStream(OUTPUT_FILE);	
	
	conn.describe(sobjName)
	.then(response => {
		// Emit the Apex class header
		ws.write(`public with sharing class ${APEX_CLASS_NAME} {\n\n`)
		ws.write(`${INDENT1}/**\n`)
		ws.write(`${INDENT2}Models a ${sobjName} object. Note that the 'Id' property is mapped to 'recordId'.\n`)
		ws.write(`${INDENT1}*/\n`)
		ws.write(`${INDENT1}public class ${APEX_CLASS_NAME} {\n`)
			
		var fieldArray = util.buildFieldArray(response.fields)

		// Write all of the class properties.
		fieldArray.forEach((field, index, fields) => {
			ws.write(`${INDENT2} public ${util.transcodeDataType(field[FIELD_METADATA].type)} ${field[PRETTY_FIELD_NAME]} {get; set;}\n`)
		}) 

		ws.write('\n');

		// Write default constructor.
		ws.write(`${INDENT2}/**\n`)
		ws.write(`${INDENT3}Default, parameterless constructor.\n`)
		ws.write(`${INDENT2}*/\n`)
		ws.write(`${INDENT2}public ${APEX_CLASS_NAME}() {\n\n`)
		ws.write(`${INDENT2}}\n\n`);
		

		// Write constructor which accepts the target custom object.
		ws.write(`${INDENT2}/**\n`)
		ws.write(`${INDENT3}Convenience constructor, builds Msg object from the specified custom object.\n`)
		ws.write(`${INDENT2}*/\n`)
		ws.write(`${INDENT2}public ${APEX_CLASS_NAME}(${sobjName} ${SOBJECT_FIRST_LETTER}) {\n`)
		ws.write(`${INDENT3}this.constructObject(${sobjName.charAt(0).toLowerCase()});\n`)
		ws.write(`${INDENT2}}\n`)
		ws.write(`${INDENT2}\n\n`)



		// Write the 'constructObject(sobject) method.
		ws.write(`${INDENT2}/**\n`)
		ws.write(`${INDENT3}Constructs the Msg object from an SObject.\n`)
		ws.write(`${INDENT2}*/\n`)
		ws.write(`${INDENT2}private ${APEX_CLASS_NAME} constructObject(${sobjName} ${SOBJECT_FIRST_LETTER}) {\n`);
		fieldArray.forEach((field, index, fields) => {
			ws.write(`${INDENT3}this.${field[PRETTY_FIELD_NAME]} = ${SOBJECT_FIRST_LETTER}.${field[RAW_FIELD_NAME]};\n`)
		}) 
		// The closing curly for the constructObject method.
		ws.write(`${INDENT2}}\n\n\n`)



		// Write the toRecord() convenience record which converts a Msg object to its equivalent sobject type.
		ws.write(`${INDENT2}/**\n`)
		ws.write(`${INDENT3}Convenience method for converting a Msg object into its equivalent sobject type.\n`)
		ws.write(`${INDENT2}*/\n`)
		ws.write(`${INDENT2}public ${sobjName} toRecord() {\n`);

		ws.write(`${INDENT3}${sobjName} ${SOBJECT_FIRST_LETTER} = new ${sobjName}();\n`)

		// Move Msg properties to new SOBject instance properties.
		fieldArray.forEach((field, index, fields) => {
			if (field[0] === 'recordId') {
			ws.write(`${INDENT3}if(!String.isBlank(this.recordId)) {\n`)
			ws.write(`${INDENT4}${SOBJECT_FIRST_LETTER}.Id = this.recordId;\n`)
			ws.write(`${INDENT3}}\n`)  // close if statemnt.
			}
			else {
			ws.write(`${INDENT3}${SOBJECT_FIRST_LETTER}.${field[1]} = this.${field[0]};\n`)
			}
		}) 
		ws.write(`${INDENT3}return ${SOBJECT_FIRST_LETTER};\n`)


		// The closing curly for toRecord() method.
		ws.write(`${INDENT2}}\n\n\n`)

		// write final closing Class definition brace.
		ws.write('}\n')

		//vscode.window.showInformationMessage('Message class successfully generated to: ' + 'src' + path.sep + 'classes' + path.sep + APEX_CLASS_NAME+'.cls');
		vscode.workspace.openTextDocument(OUTPUT_FILE).then(doc => vscode.window.showTextDocument(doc, 3));
	  })
	  .catch(err => console.log('\n\nError building message class: ', err))
		
	return true;
}