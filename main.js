async function getForecast(url) {
	let response = await fetch(url);
	let xmlString = await response.text();
	let json = xmlToJson(stringToXml(xmlString));
	let parameters = json['wfs:FeatureCollection']['wfs:member'];
	let dataset = {};

	// need to fetch at least 2 parameters for it to respond like this
	parameters.forEach((parameter, i) => {
		let name = parameter['omso:PointTimeSeriesObservation']
		['om:result']
		['wml2:MeasurementTimeseries']
		['@attributes']
		['gml:id'].split('-').pop();

		let timeValuePair = parameter['omso:PointTimeSeriesObservation']
			['om:result']
			['wml2:MeasurementTimeseries']
			['wml2:point'];

		let times = [];
		let values = [];
		timeValuePair.forEach((item, i) => {
			// TODO: skip NaN
			times.push(item['wml2:MeasurementTVP']['wml2:time']['#text']);
			values.push(parseFloat(item['wml2:MeasurementTVP']['wml2:value']['#text']));
		});

		dataset[name] = {
			times: times,
			values: values
		};
	});

	return dataset;
}


async function main() {
	let url = 'https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0';
	url += '&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair';
	url += '&request=getFeature&place=turku';
	// url += '&parameters=Temperature,Humidity';

	// add starttime + endtime and filter out NaN

	let dataset = await getForecast(url);
	//console.log(dataset)

	processData(dataset);
}

function processData(dataset) {

	if (dataset.hasOwnProperty('Temperature')) {
		chartTemperature(dataset['Temperature'])
	}

	if (dataset.hasOwnProperty('WindUMS') && dataset.hasOwnProperty('WindVMS')) {
		let combinedData = {
			times: dataset['WindUMS'].times
		}
		points = []
		for (let i = 0; i < dataset['WindUMS'].values.length; i++) {
			points.push({
				x: dataset['WindUMS'].values[i],
				y: dataset['WindVMS'].values[i]
			});
		}
		combinedData.points = points;
		chartWind(combinedData);
	}

	if (dataset.hasOwnProperty('WindSpeedMS')) {
		chartWindSpeed(dataset['WindSpeedMS'])
	}

	if (dataset.hasOwnProperty('Precipitation1h') && dataset.hasOwnProperty('PrecipitationAmount')) {
		chartPrecipitation(dataset['Precipitation1h'], dataset['PrecipitationAmount']);
	}
}

//
// // TEMPERATURE
// const tempData = parameters[0]['omso:PointTimeSeriesObservation']
//                               ['om:result']
//                               ['wml2:MeasurementTimeseries']
//                               ['wml2:point'];
//
// let time = tempData.map((e) => {
//   let d = new Date(e['wml2:MeasurementTVP']['wml2:time']['#text']);
//   return timeSymbols[d.getHours()];
// });
//
// let temp = tempData.map((e) => {
//   return parseFloat(e['wml2:MeasurementTVP']['wml2:value']['#text']);
// });
//
// let col = temp.map((e) => {
//   let hue = Math.max(0,Math.min(270, (e - (-20.0)) * (0.0 - 270.0) / (30.0 - (-20.0)) + 270.0));
//   return 'hsla(' +hue + ',85%,84%,1)';
// });
// let col_ = temp.map((e) => {
//   let hue = Math.max(0,Math.min(270, (e - (-20.0)) * (0.0 - 270.0) / (30.0 - (-20.0)) + 270.0));
//   return 'hsla(' +hue + ',85%,84%,0.2)';
// });
//
// chartTemp(time,temp,col,col_);
//
//
//
// const wdData = parameters[1]['omso:PointTimeSeriesObservation']
//                             ['om:result']
//                             ['wml2:MeasurementTimeseries']
//                             ['wml2:point'];
//
// let deg = [90, 45, 0, 315, 270, 225, 180, 135];
// let stre = [1, 1, 1, 1, 1, 1, 1, 1];
//
// wdData.forEach((e, i) => {
//   let dg = parseFloat(e['wml2:MeasurementTVP']['wml2:value']['#text']);
//
//   ii = Math.round(-dg/45+10);
//   if (ii >= 8) { ii -= 8; }
//   stre[ii] += 1;
// });
//
// chartDir(deg,stre);
//
// const wsData = parameters[2]['omso:PointTimeSeriesObservation']
//                             ['om:result']
//                             ['wml2:MeasurementTimeseries']
//                             ['wml2:point'];
//
// let timeWS = wsData.map((e) => {
//   let d = new Date(e['wml2:MeasurementTVP']['wml2:time']['#text']);
//   return weekdays[d.getDay()]+' '+d.getHours().toString().padStart(2,'0')+':00';
// });
//
// let speedWS = wsData.map((e) => {
//   return parseFloat(e['wml2:MeasurementTVP']['wml2:value']['#text']);
// });
//
// chartWS(timeWS,speedWS);
//
// // HUMIDITY
// const humi = parameters[3]['omso:PointTimeSeriesObservation']
//                             ['om:result']
//                             ['wml2:MeasurementTimeseries']
//                             ['wml2:point'];
//
//
// let humidity = humi.map((e) => {
//   return parseFloat(e['wml2:MeasurementTVP']['wml2:value']['#text']);
// });
// chartHumi(humidity);
//
// const wsymb = parameters[4]['omso:PointTimeSeriesObservation']
//                             ['om:result']
//                             ['wml2:MeasurementTimeseries']
//                             ['wml2:point'];
// // let wss = wsymb.map((e) => {
// //   let d = weatherSymbols[parseInt(e['wml2:MeasurementTVP']['wml2:value']['#text'])];
// //   return d;
// // });
// wsymb.forEach((item, i) => {
//   let symlist = document.getElementById('twoRowSpan');
//   let d_ = new Date(item['wml2:MeasurementTVP']['wml2:time']['#text']);
//   let t_ = weekdays[d_.getDay()] + " "+ d_.getHours().toString().padStart(2,'0')+':00';
//   let s_ = weatherSymbols[parseInt(item['wml2:MeasurementTVP']['wml2:value']['#text'])];
//   symlist.innerHTML = symlist.innerHTML + '<p>' + t_ + ' ' + s_ +'</p>';
// });

const WEEKDAYS = {
	0: 'Sunday',
	1: 'Monday',
	2: 'Tuesday',
	3: 'Wednesday',
	4: 'Thursday',
	5: 'Friday',
	6: 'Saturday'
}

const timeSymbols = {
	0: '🌑',
	1: '🌑',
	2: '🌒',
	3: '🌒',
	4: '🌒',
	5: '🌓',
	6: '🌓',
	7: '🌓',
	8: '🌔',
	9: '🌔',
	10: '🌔',
	11: '🌕',
	12: '🌕',
	13: '🌕',
	14: '🌖',
	15: '🌖',
	16: '🌖',
	17: '🌗',
	18: '🌗',
	19: '🌗',
	20: '🌘',
	21: '🌘',
	22: '🌘',
	23: '🌑'
}

const weatherSymbols = {
	1: '☀️ selkeää',
	2: '⛅️ puolipilvistä',
	21: '🌧 heikkoja sadekuuroja',
	22: '🌧 sadekuuroja',
	23: '🌧 voimakkaita sadekuuroja',
	3: '☁️ pilvistä',
	31: '🌧 heikkoa vesisadetta',
	32: '🌧 vesisadetta',
	33: '🌧 voimakasta vesisadetta',
	41: '🌨 heikkoja lumikuuroja',
	42: '🌨 lumikuuroja',
	43: '🌨 voimakkaita lumikuuroja',
	51: '🌨 heikkoa lumisadetta',
	52: '🌨 lumisadetta',
	53: '🌨 voimakasta lumisadetta',
	61: '⚡️ ukkoskuuroja',
	62: '⚡️ voimakkaita ukkoskuuroja',
	63: '⚡️ ukkosta',
	64: '⚡️ voimakasta ukkosta',
	71: '❄️💧 heikkoja räntäkuuroja',
	72: '❄️💧 räntäkuuroja',
	73: '❄️💧 voimakkaita räntäkuuroja',
	81: '❄️💧 heikkoa räntäsadetta',
	82: '❄️💧 räntäsadetta',
	83: '❄️💧 voimakasta räntäsadetta',
	91: '💨 utua',
	92: '🌫 sumua'
}

function stringToXml(xml) {
	var dom = null;
	if (window.DOMParser) {
		try {
			dom = (new DOMParser()).parseFromString(xml, "text/xml");
		}
		catch (e) { dom = null; }
	}
	else if (window.ActiveXObject) {
		try {
			dom = new ActiveXObject('Microsoft.XMLDOM');
			dom.async = false;
			if (!dom.loadXML(xml)) // parse error ..

				window.alert(dom.parseError.reason + dom.parseError.srcText);
		}
		catch (e) { dom = null; }
	}
	else
	alert("cannot parse xml string!");
	return dom;
}


// Changes XML to JSON
function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};


function chartWind(d) {
	let ctx = document.getElementById('canvasChartWind').getContext('2d');
	Chart.defaults.global.legend.display = false;

	// check max value, scale chart
	// color values now -> later

	let col = d.times.map((cv,i,a) => {
		let hue = 179; // i  * (220.0 - 179.0) / a.length + 179;
		let o = i  * (0.1 - 1.0) / a.length + 1.0;
		return 'hsla(' +hue + ',85%,84%,'+o+')';
	});


	let myChart = new Chart(ctx, {
		type: 'scatter',
		data: {
			labels: d.times,
			datasets: [{
				data: d.points,
				borderColor: col,
				borderWidth: 3,
				pointRadius: 4
			}]
		},
		options: {
			tooltips: {
				bodyFontColor: "#C8D3F5",
				bodyFontFamily: 'Lato',
				bodyFontSize: 20,
				callbacks: {
					label: function(tooltipItem, data) {
						return timeLabel(data.labels[tooltipItem.index]);
					}
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15,
						beginAtZero: true,
						maxTicksLimit: 5,
						padding: 20,
						min: -10,
						max: 10

					},
					gridLines: {
						drawTicks: true,
						display: true,
						zeroLineColor: "#C8D3F5"
					}
				}],
				xAxes: [{
					gridLines: {
						drawTicks: true,
						display: true,
						zeroLineColor: "#C8D3F5"
					},
					ticks: {
						padding: 20,
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15,
						beginAtZero: true,
						min: -10,
						max: 10
					}
				}]
			}
		}
	});
}

function timeLabel(time) {
	let d = new Date(time);
	return `${WEEKDAYS[d.getDay()]} ${d.getHours().toString().padStart(2,'0')}:00`;
}

function chartTemperature(data) {

	let ctx = document.getElementById('htmlChartTemp').getContext('2d');
	Chart.defaults.global.legend.display = false;
	// Chart.defaults.global.tooltips.enabled = false;

	let col = data.values.map((e) => {
		let hue = Math.max(0,Math.min(270, (e - (-20.0)) * (0.0 - 270.0) / (30.0 - (-20.0)) + 270.0));
		return 'hsla(' +hue + ',85%,84%,1)';
	});
	let col_ = data.values.map((e) => {
		let hue = Math.max(0,Math.min(270, (e - (-20.0)) * (0.0 - 270.0) / (30.0 - (-20.0)) + 270.0));
		return 'hsla(' +hue + ',85%,84%,0.2)';
	});


	let x = [];
	data.times.forEach((item, i) => {
		x.push(timeLabel(item));
	});


	var myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: x,
			datasets: [{
				data: data.values,
				fill: true,
				borderColor: "#B4F9F8",
				backgroundColor: col_,
				borderColor: col,
				hoverBackgroundColor: col_,
				hoverBorderColor: col,
				borderWidth: 2
			}]
		},
		options: {
			tooltips: {
				titleFontColor: "#C8D3F5",
				titleFontFamily: 'Lato',
				titleFontSize: 20,
				bodyFontColor: "#C8D3F5",
				bodyFontFamily: 'Lato',
				bodyFontSize: 20

			},
			scales: {
				yAxes: [{
					ticks: {
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15,
						beginAtZero: false,
						maxTicksLimit: 5,
						padding: 20

					},
					gridLines: {
						drawTicks: true,
						display: true,
						zeroLineColor: "transparent"
					}
				}],
				xAxes: [{
					display:false,
					gridLines: {
						zeroLineColor: "transparent"
					},
					ticks: {
						padding: 20,
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15
					}
				}]
			}
		}
	});
}

function chartHumi(y) {

	let ctx = document.getElementById('canvasChartHumidity').getContext('2d');
	Chart.defaults.global.legend.display = false;
	let bkg_gradient = ctx.createLinearGradient(0, 0, 0, 200);
	bkg_gradient.addColorStop(0, '#C8D3F550');
	bkg_gradient.addColorStop(1, '#C8D3F500');

	let myChart4 = new Chart(ctx, {
		type: 'line',
		data: {
			labels: Array(y.length).fill(''),
			datasets: [{
				fill: true,
				borderColor: "#B4F9F8",
				backgroundColor: bkg_gradient,
				borderWidth: 4,
				lineTension: 0.3,
				data: y,
				pointRadius: 0
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15,
						beginAtZero: false,
						maxTicksLimit: 5,
						padding: 20

					},
					gridLines: {
						drawTicks: true,
						display: true,
						zeroLineColor: "transparent"
					}
				}],
				xAxes: [{
					gridLines: {
						zeroLineColor: "transparent"
					},
					ticks: {
						padding: 20,
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15
					}
				}]
			}
		}
	});
}

function chartPrecipitation(a,b) {

	let ctx = document.getElementById('canvasChartPreci').getContext('2d');
	let bkg_gradient = ctx.createLinearGradient(0, 0, 0, 500);
	bkg_gradient.addColorStop(0, '#C8D3F550');
	bkg_gradient.addColorStop(1, '#C8D3F500');

	let myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: a.times,
			datasets: [{
				data: a.values,
				fill: true,
				borderColor: "#B4F9F8",
				backgroundColor: bkg_gradient,
				borderWidth: 4,
				lineTension: 0.3,
				pointRadius: 0
			}, {
					data: b.values,
					fill: true,
					borderColor: "#B4F9F8",
					backgroundColor: bkg_gradient,
					borderWidth: 4,
					lineTension: 0.3,
					pointRadius: 0
				}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15,
						beginAtZero: false,
						maxTicksLimit: 5,
						padding: 20

					},
					gridLines: {
						drawTicks: true,
						display: true,
						zeroLineColor: "transparent"
					}
				}],
				xAxes: [{
					display:false,
					gridLines: {
						zeroLineColor: "transparent"
					},
					ticks: {
						padding: 20,
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15
					}
				}]
			}
		}
	});
}

function chartWindSpeed(d) {

	let ctx = document.getElementById('canvasWindSpeed').getContext('2d');
	Chart.defaults.global.legend.display = false;
	let bkg_gradient = ctx.createLinearGradient(0, 0, 0, 500);
	bkg_gradient.addColorStop(0, '#C8D3F550');
	bkg_gradient.addColorStop(1, '#C8D3F500');

	let myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: d.times,
			datasets: [{
				data: d.values,
				fill: true,
				borderColor: "#B4F9F8",
				backgroundColor: bkg_gradient,
				borderWidth: 4,
				lineTension: 0.3,
				pointRadius: 0
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						fontColor: "#C8D3F5",
						fontFamily: 'Lato',
						fontSize: 15,
						beginAtZero: true,
						maxTicksLimit: 5,
						padding: 20

					},
					gridLines: {
						drawTicks: true,
						display: true,
						zeroLineColor: "transparent"
					}
				}],
				xAxes: [{
					display:false
				}]
			}
		}
	});
}

function chartDir(time,temp) {

	let ctx2 = document.getElementById('myChart2').getContext('2d');
	var myChart2 = new Chart(ctx2, {
		type: 'radar',
		data: {
			labels: time,
			datasets: [{
				fill: true,
				borderColor: "#B4F9F8",
				backgroundColor: "#C8D3F530",
				borderWidth: 4,
				lineTension: 0,
				data: temp,
				pointRadius: 0
			}]
		},
		options: {
			scale: {
				ticks: {
					backdropColor: "#ffffff00"
				}
			}
		}
	});
	// console.log(myChart2);
}


main();
