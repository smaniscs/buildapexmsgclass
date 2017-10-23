# BuildApexMsgClass README

This is a Visual Studio Code extension which works with the Salesforce platform to generate an Apex "Message" class from a selected sObject.  A Message class is used to normalize/simplify sObject field names in JSON message payloads.

## Requirements

The credentials, login URL, and API version for the target Salesforce org are read from config file *force.json*, which must exist in the root of your project.  If you also happen to be using the most excellent [ForceCode](https://github.com/celador/ForceCode) extension for Salesforce platform dev work, your project will already have a force.json. 

If not using ForceCode, manually create force.json at the root of your project using this minimal structure:

```
{
	"apiVersion": "40.0",
	"username": "someUser@somedomain.com",
	"password": "S00perSekr3tPa$$w0rd_and_access_token_here",
	"url": "https://login.salesforce.com"
}
```
Note that the password and access token should be one contiguous string, with no delimiter or space between them.

## Installation

1. Download the [buildapexmsgclass-1.0.2.vsix](https://github.com/smaniscs/buildapexmsgclass/raw/master/buildapexmsgclass-1.0.2.vsix) package to a temp folder.
2. Press keyboard shortcut F1 to open the Command Palette.
3. Find 'Extension: Install From VSIX...' and press ENTER.
4. In the file open dialog,  locate the VSIX file you download in step 1, then click the Open button.

## Usage/Features

Open the Command Palette (keyboard shortcut F1 on Windows and Mac) and choose *Build Apex Message Class* to run this extension.  A list of all editable, insertable, or deleteable sObjects found in the target org will be listed;  if an sObject is not editable, not insertable, and not deleteable,  it's excluded from the list.  After picking an sObject from the list,  an Apex Message class will be generated into your projects *src/classes* folder and a text editor pane automatically opened for the newly generated file.  Pressing ESCAPE when the sObject list is displayed will cancel generation of the Message class.

The generated Message class name and all of its setter/getter names are normalized, i.e. any package name, underscores, and '__c' are removed from the names. The generated Message class name is the normalized sObject name with 'Msg' appended.  e.g., a custom object named *Some_Custom_Object__c*  would result in a Message class name of *SomeCustomObjectMsg.cls*.  Setter/getter field names are normalized, then camel-cased,  e.g. packaged sObject field *Some_Package__Site_Visit_Date__c* would be named *siteVisitDate*.

The Message class contains a convenience constructor which accepts an instance of the target sObject, allowing you to quicky/easily create a fully populated Message object.  Conversely, a *toRecord()* method is provided to let you quickly convert a populated Mesage object into an instance of the target sObject.

## Known Issues

The generated Message class and meta.xml file are generated locally and you are required to manually push these files to the target org.  In the next release, the Tooling API will be used to create the Message class, then retrieve the class from the target org and store it in your project.  

If using the ForceCode extension on a Mac, you can press OPTION+COMMAND+S to force a save to your org on the currenly open text editor pane.

## Change Log

[Change Log] (CHANGELOG.md)