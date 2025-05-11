/*------------------------------------------------------------------------------------------------------/
| Program		: EXEC_SERVER_LOG.js
| Event		: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: ECLIPSE PLUGIN
| Created at	: 13/12/2015 10:51:04
|
/------------------------------------------------------------------------------------------------------*/
var lines = aa.env.getValue("lines");
var logDir = com.accela.util.AVProperties.getServerLogDir();
var file = logDir + "/server.log";
var fileHandler = null;
try {
	fileHandler = new java.io.RandomAccessFile(file, "r");
	var fileLength = fileHandler.length() - 1;
	var sb = new java.lang.StringBuilder();
	var line = 0;

	for (var filePointer = fileLength; filePointer != -1; filePointer--) {

		fileHandler.seek(filePointer);
		var readByte = fileHandler.readByte();

		var char = String.fromCharCode(readByte);

		if (char == "\n\r") {

			if (filePointer < fileLength) {
				line = line + 1;
			}
		} else if (readByte == 0xD) {
			if (filePointer < fileLength - 1) {
				line = line + 1;
			}
		}
		if (line >= lines) {
			break;
		}
		sb.append(char);
	}

	var lastLine = sb.reverse().toString();
	aa.env.setValue("SUCCESS", true)
	aa.env.setValue("LOG", lastLine)
} catch (e) {
	aa.env.setValue("SUCCESS", false)
	aa.env.setValue("ERROR", e)
} finally {
	if (fileHandler != null)
		try {
			fileHandler.close();
		} catch (e) {
		}
}