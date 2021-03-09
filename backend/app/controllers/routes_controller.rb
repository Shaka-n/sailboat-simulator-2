class RoutesController < ApplicationController

    def show
        route = Route.find(params[:id])
        total_travel_time = route.total_travel_time
        render json: total_travel_time
    end

    def index
        routes = Route.all
        render json: routes
    end
# This controller action has to do these things: 
    # receive the post request from the frontend,
    # create a new table entry, 
    # GET the forecast for each coordinate pair,
    # calculate the distance between each point using the haversine formula
    # calculate the travel time between each point using the sailboat transform functions,
    # sum the travel times together and return the total travel time as a response to the frontend
    def create
        route = Route.create!(user_id: params[:user_id], coordinates: params[:coordinates], name: params[:name])
        # byebug
        total_travel_time_and_distance = route.total_travel_time
        puts "Total Travel Time and Distance"
        puts total_travel_time_and_distance["time"]
        puts total_travel_time_and_distance["distance"]
        # byebug
        render json: total_travel_time_and_distance
    end

    private
    def route_params 
        params.require(:route).permit(:user_id, :coordinates)
    end
end
