require 'httparty'

class ForecastFetcher
    @@grid_endpoint= 'https://api.weather.gov/points'
    @@headers = {"User-Agent" => ("simple-sailboat-simulator, g.s.sahagian@gmail.com")}

    def initialize(coordinate)
        @coordinateX = coordinate[0]
        @coordinateY = coordinate[1]
    end

    def fetch_grid
        grid = HTTParty.get(
        `#{@@grid_endpoint}/#{@coordinateX},#{@coordinateY}`,
        :headers => @@headers
        )

        pp grid.body.properties.forecast
    end

end