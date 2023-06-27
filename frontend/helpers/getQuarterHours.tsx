export default function getQuarterHours () {
  var quarterHours = ["00", "15", "30", "45"];
  var times: string[] = [];
  for(var i = 0; i < 24; i++){
    for(var j = 0; j < 4; j++){
      var time = i + ":" + quarterHours[j];
      if(i < 10){
        time = "0" + time;
      }
      times.push(time);
    }
  }
  return times;
}