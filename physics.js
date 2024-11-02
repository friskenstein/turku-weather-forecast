// Apparent Temperature https://planetcalc.com/2089/

function windChill(airTemp, windSpeed) {
	/*Wind chill index is the felt air temperature on exposed skin due to wind.
	  The wind chill temperature is never higher than the air temperature, and the
	  windchill is undefined at higher temperatures (above 10 °C).
	  Paul Allman Siple and Charles Passel developed the first wind chill formulae,
	  working in the Antarctic before the Second World War. Then formulae are
	  evolved, and this calculator uses the one from U.S. National Weather Service

	  Windchill Temperature is only defined for temperatures at or below 10 °C
	  (50 °F) and wind speeds above 4.8 kilometers per hour (about 1.3 meters per
	  second)
	  */
	if (airTemp > 10.0) return undefined;
	if (windSpeed * 3.6 < 4.8) return undefined;
	return (
		13.12
			+ 0.6215 * airTemp
			- 11.37 * (windSpeed * 3.6) ** 0.16
			+ 0.3965 * airTemp * (windSpeed * 3.6) ** 0.16
	);
}
