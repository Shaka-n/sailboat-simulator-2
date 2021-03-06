class AddNameToRoutes < ActiveRecord::Migration[6.0]
  def change
    add_column :routes, :name, :string
  end
end
