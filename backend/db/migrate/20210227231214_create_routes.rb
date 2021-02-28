class CreateRoutes < ActiveRecord::Migration[6.0]
  def change
    create_table :routes do |t|
      t.string :coordinates
      t.belongs_to :user

      t.timestamps
    end
  end
end
