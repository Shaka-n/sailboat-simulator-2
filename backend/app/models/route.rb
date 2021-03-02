require 'haversine'
class Route < ApplicationRecord
    belongs_to :user, optional: true

    # Loop over coordinates
    # on each loop, 
        # convert wind angle to relative to boat's bow
        # calculate distance to the next coordinate
        # calc the boat speed
        # multiply them
        # add the resulting travel time to the running total
    # when loop is over, return the total travel time
    def heading(wind_direction)
        degrees={
            "E"=>0,
            "NE"=> 45,
            "N"=>90,
            "NW"=> 135,
            "W"=>180,
            "SW"=>225,
            "S"=> 270,
            "SE"=>315
        }
        degrees[wind_direction]
        # cX1 = coordinates1[0]
        # cY1 = coordinates1[1]
        # cX2 = coordinates2[0]
        # cY2 = coordinates2[1]
        # # if the first Y is less than the second Y, we're going North
        # if(cY1 < cY2)
        #     # If the first X is less than the second X, we;re going  West
        #     if(cX1<cx2)
        # # if the first Y is greater than the second Y, we're going South
        # else
        # end
    end



    def total_travel_time
        intCoordinates = JSON.parse(self.coordinates)
        intCoordinates.each_with_index.reduce(0) do |sum_travel_time, (coordinate, index)| 
            next_coordinate = intCoordinates[index+1]
            if next_coordinate != nil
                # byebug
                distance = Haversine.distance(coordinate[0], coordinate[1], next_coordinate[0], next_coordinate[1]).to_miles
                wind = ForecastFetcher.new(coordinate).fetch_wind_data
                # Need to convert wind direction to a degree representation
                # For now, let's just hard code it
                boat = Boat.new(self.heading(wind["wind_direction"]),wind["wind_speed"])
                speed = boat.velocity * distance
            end
        end
    end
end