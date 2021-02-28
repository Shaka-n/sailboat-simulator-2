class RoutesController < ApplicationController

    def show
        route = Route.find(params[:id])
    end

    def index
        routes = Route.all
    end
# This controller action has to do these things: 
    # receive the post request from the frontend,
    # create a new table entry, 
    # GET the forecast for each coordinate pair,
    # calculate the distance between each point using the haversine formula
    # calculate the travel time between each point using the sailboat transform functions,
    # sum the travel times together and return the total travel time as a response to the frontend
    def create
        puts params
        route = Route.create(user_id: params["user_id"], coordinates: params["coordinates"])
        # byebug
        render json: route
    end

    private
    def route_params 
        params.require(:route).permit(:user_id, :coordinates)
    end
end
