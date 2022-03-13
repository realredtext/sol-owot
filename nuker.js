function spam(strng){var s = strng.repeat(2000);s = s + "\n"; s = s.repeat(2000); for(var i = 0; i < s.length; i++){ var c = s[i]; writeChar(c,false)}}; spam(" ")
