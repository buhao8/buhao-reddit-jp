export function unix2str(unix_time) {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds
  var date = new Date(unix_time * 1000);

  var year = date.getFullYear();
  var month = "0" + date.getMonth();
  var day = "0" + date.getDay();

  // Hours part from the timestamp
  var hours = date.getHours();

  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();

  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  var formattedTime = 
    year + "/" + month.slice(-2) + "/" + day.slice(-2) + " @ "
    + hours + ':' + minutes.slice(-2) + ':' + seconds.slice(-2);

  return formattedTime;
}

export function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}