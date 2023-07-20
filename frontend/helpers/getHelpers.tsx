export const getFirstKey = (object: any) => {
  const keyList = Object.keys(object)

  return keyList[0]
}

export const getKeyByValue = (object: any, value: string) => {
  const foundKey = Object.keys(object).find((key) => object[key] === value);
  return foundKey;
}

export const getQuarterHours = () => {
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

export const getTime = (time: Date) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;
  return `${sHours}:${sMinutes}`
}

export const trueOrFalse = (value: 'Yes' | 'No') => {
  if (value === 'Yes') {
    return true
  }

  return false
}