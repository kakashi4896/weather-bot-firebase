const functions = require('firebase-functions');
const https = require('https');

const key = '<put_your_own_key>';
const host = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0003-001?Authorization=${key}&format=JSON`;


// line回訊息
function getResponseObj(message) {
  return {
    fulfillmentMessages: [{
      text: {
        text: [message],
      },
    }],
    source: '',
  };
}

// 生成訊息
function generateCityMessage(weather, city1) {
  const temp = weather[3].elementValue.value;
  const humit = ((weather[4].elementValue.value) * 100);
  const str = `${city1}現在的氣溫是 ${temp} 度，濕度${humit}%。`;
  return getResponseObj(str);
}


function parseData(locationData, city1) {
  const findlocation = locationData.find((item) => {
    return item.locationName === city1;
  });
  if (findlocation === undefined) {
    return getResponseObj('找不到你輸入的地方，請重新輸入');
  }
  else {
    return generateCityMessage(findlocation.weatherElement, city1);
  }
}

/*
function parseData(locationData, city1) {
  const findlocation = locationData.find((item) => {
    return item.locationName === city1;
  });
  return generateCityMessage(findlocation.weatherElement, city1);
}
*/

exports.helloHttp = functions.https.onRequest((request, response) => {
  // Get the city and date from the request
  const city1 = request.body.queryResult.parameters.city_01;

  // Get weather with cwb API and parse xml data to json
  const req = https.get(host, res => {
    let responsData = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      responsData += chunk;
    });
    res.on('end', () => {
      const xx = JSON.parse(responsData);
      return response.json(parseData(xx.cwbopendata.location, city1));
    });
  });
  req.on('error', error => {
    return response.json(getResponseObj(error));
  });
});
