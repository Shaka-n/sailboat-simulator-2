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
            "E"=>1,
            "NE"=> 45,
            "N"=>90,
            "NW"=> 135,
            "W"=>180,
            "SW"=>225,
            "S"=> 270,
            "SE"=>315
        }
        degrees[wind_direction]

    end
    
    def boat_heading(coordinate, next_coordinate)
        if coordinate[0] > next_coordinate[0]
            boat_heading = "E"
            if coordinate[1] > next_coordinate[1]
                boat_heading = "SE"
            else
                boat_heading = "NE"
            end
        else
            boat_heading = "W"
            if coordinate[1] > next_coordinate[1]
                boat_heading = "SE"
            else
                boat_heading = "NE"
            end
        end

        adjusted_heading = heading(boat_heading)
    end



    def total_travel_time
        intCoordinates = JSON.parse(self.coordinates)
        sum_travel_time = 0
        intCoordinates.each_with_index do |coordinate, index| 
            next_coordinate = intCoordinates[index+1]
            if next_coordinate != nil
                distance = Haversine.distance(coordinate[0], coordinate[1], next_coordinate[0], next_coordinate[1]).to_miles
                wind = ForecastFetcher.new(coordinate).fetch_wind_data
                # Need to convert wind direction to a degree representation
                # For now, let's just hard code it
                adjusted_wind_angle = heading(wind["wind_direction"]) - boat_heading(coordinate, next_coordinate)
                boat = Boat.new(adjusted_wind_angle.abs, wind["wind_speed"])
                velocity = boat.velocity
                # byebug
                travel_time = distance / velocity
                sum_travel_time += travel_time
            end
        end
        # byebug
        sum_travel_time
    end
end