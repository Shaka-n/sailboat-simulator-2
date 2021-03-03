require 'httparty'
require 'json'

class ForecastFetcher
    @@grid_endpoint= 'https://api.weather.gov/points/'
    @@headers = {
        "User-Agent" => "simple-sailboat-simulator, g.s.sahagian@gmail.com.",
        "Accepts" => "application/geo+json"
    }

    def initialize(coordinate)
        # byebug
        @coordinateX = coordinate[1].round(3)
        @coordinateY = coordinate[0].round(3)
    end
# In order to get the forecast, we need the relavent weather station and grid square. This necessitates two fetches, and is apparently non-negotiable.
# We can find the appropriate station endpoint using the coordinate point endpoint
    def get_grid_endpoint
        grid = HTTParty.get(
        "#{@@grid_endpoint}#{@coordinateX},#{@coordinateY}",
        :headers => @@headers,
        # :debug_output => $stdout
        )
        grid_body = JSON.parse(grid.body)
        # byebug
        forecast_endpoint = grid_body['properties']['forecast']
    end
    # This part bears some explaining. The forecast is broken up by "periods", whcih is demarcated differently between the current day and the rest of the coming week
    # For our purposes, we will only pull the first period, which is the current or most immediate period.
    def fetch_current_forecast
       status_code = 500
        get_counter = 0
        # TODO HANDLE 404's MORE GRACEFULLY WHEN REQUESTING MARINE POINTS 
        while status_code == 500 && get_counter < 20 do
            puts "Making the #{get_counter} request to forecast endpoint."
            forecast = HTTParty.get(
                get_grid_endpoint,
                :headers => @@headers,
                # :debug_output => $stdout
                )
            status_code = forecast.code
            get_counter += 1
        end
        # byebug   
        week_forecast = JSON.parse(forecast.parsed_response)
        # byebug
        if week_forecast['properties'] == nil
            byebug
            puts "week_forecast nil"
        end
        current_forecast = week_forecast["properties"]["periods"]
        # byebug
        # immediate_forecast = current_forecast.find{|period| period['number'] == 1}
        immediate_forecast = current_forecast[0]
        # byebug
        immediate_forecast
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