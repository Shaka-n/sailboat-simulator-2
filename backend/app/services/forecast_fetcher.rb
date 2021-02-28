require 'httparty'
require 'json'

class ForecastFetcher
    @@grid_endpoint= 'https://api.weather.gov/points/'
    @@headers = {
        "User-Agent" => "simple-sailboat-simulator, g.s.sahagian@gmail.com.",
        "Accepts" => "application/geo+json"
    }

    def initialize(coordinate)
        @coordinateX = coordinate[0]
        @coordinateY = coordinate[1]
    end
# In order to get the forecast, we need the relavent weather station and grid square. This necessitates two fetches, and is apparently non-negotiable.
# We can find the appropriate station endpoint using the coordinate point endpoint
    def get_grid_endpoint
        grid = HTTParty.get(
        "#{@@grid_endpoint}/#{@coordinateX},#{@coordinateY}",
        :headers => @@headers
        )
        grid_body = JSON.parse(grid.body)
        forecast_endpoint = grid_body['properties']['forecast']
    end
    # This part bears some explaining. The forecast is broken up by "periods", whcih is demarcated differently between the current day and the rest of the coming week
    # For our purposes, we will only pull the first period, which is the current or most immediate period.
    def fetch_current_forecast
        forecast = HTTParty.get(
            get_grid_endpoint,
            :headers => @@headers
            )
        week_forecast = JSON.parse(forecast.body)['properties']['periods']
        current_forecast = week_forecast.find{|period| period['number'] == 1}
    end

    def fetch_wind_data 
        current_forecast = fetch_current_forecast
        # Wind speed comes as a string (e.g. "10 to 15 mph") so we need to .split it and take the first value. 
        # An improvement to this would be to average the speed using a helper and use that. But as it is, I'm inclined
        # to just use the lower bound, since the unoptimized sailboat transform has a tendency towards absurd speed as it is.
        wind = {
            "wind_speed" => current_forecast['windSpeed'].split(" ")[0],
            "wind_direction" => current_forecast['windDirection']
        }
        wind
    end

end