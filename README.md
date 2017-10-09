# BuildApexMsgClass README

This is a Visual Studio Code extension which works with the Salesforce platform to generate an Apex "Message" class from a selected sObject.

## Usage/Features

Open the Command Palette (on Mac: SHIFT+COMMAND+P) and choose 'Build Apex Message Class' to run this extension.  A list of all editable, insertable, or deleteable sObjects found in the target domain will be listed.  After picking an sObject from the list,  an Apex Message class will be generated into your projects *src/classes* folder and a text editor pane automatically opened for the newly generated file. Note that 'Msg' will be auto-appended to the sObject name when creating the name of the generated Message class.  e.g., if you select the Account object, the resultant Message class file will be named AccountMsg.cls.

Setter/getter field names in the Message class are normalized, i.e. any optional package name, "__c", and underscore characters are removed and the setter/getter field name is camel-cased.   e.g.,  sObject field *SM_llcbi__Site_Visit_Date__c* would be normalized to *siteVisitDate*.

The Message class will contain a convenience constructor which accepts an instance of the target sObject, allowing you to quicky/easily create a Message object.  Conversely, a *toRecord()* method is provided to let you quickly convert a populated Mesage object into an instance of the target sObject.

## Requirements

The credentials and login URL for connecting to a target Salesforce org are read from config file 'force.json', which must exist in the root of your project.  If you also happen to be using the most excellent [ForceCode](https://github.com/celador/ForceCode) extension for Salesforce platform dev work, your project will already have a force.json. If not using ForceCode, manually create force.json at the root of your project using this structure:

```
{
	"apiVersion": "40.0",
	"username": "someUser@somedomain.com",
	"password": "S00perSekr3tPa$$w0rd_and_access_token_here",
	"url": "https://login.salesforce.com"
}
```
Note that the password and access token should be one contiguous string, with no delimiter or space between the password/access token.

## Known Issues

The generated Message class and meta.xml file are generated locally and you are required to manually push these files to the target org.  In the next release, the Tooling API will be used to create the Message class in the target org, then retrieve the files and store then in your project.  

If using the ForceCode extension on a Mac, you can press OPTION+COMMAND+S to force a save to your org on the currenly open text editor pane.

## Release Notes

### 1.0.0

Initial release of the extension.