class ChangeStatusToIntegerInTasksAndProducts < ActiveRecord::Migration[8.1]
  def up
    # Tasks: todo=0, doing=1, done=2
    add_column :tasks, :status_int, :integer, default: 0
    execute "UPDATE tasks SET status_int = 0 WHERE status = 'todo'"
    execute "UPDATE tasks SET status_int = 1 WHERE status = 'doing'"
    execute "UPDATE tasks SET status_int = 2 WHERE status = 'done'"
    remove_column :tasks, :status
    rename_column :tasks, :status_int, :status

    # Products: active=0, inactive=1, archived=2
    add_column :products, :status_int, :integer, default: 0
    execute "UPDATE products SET status_int = 0 WHERE status = 'active'"
    execute "UPDATE products SET status_int = 1 WHERE status = 'inactive'"
    execute "UPDATE products SET status_int = 2 WHERE status = 'archived'"
    remove_column :products, :status
    rename_column :products, :status_int, :status
  end

  def down
    add_column :tasks, :status_str, :string, default: "todo"
    execute "UPDATE tasks SET status_str = 'todo' WHERE status = 0"
    execute "UPDATE tasks SET status_str = 'doing' WHERE status = 1"
    execute "UPDATE tasks SET status_str = 'done' WHERE status = 2"
    remove_column :tasks, :status
    rename_column :tasks, :status_str, :status

    add_column :products, :status_str, :string, default: "active"
    execute "UPDATE products SET status_str = 'active' WHERE status = 0"
    execute "UPDATE products SET status_str = 'inactive' WHERE status = 1"
    execute "UPDATE products SET status_str = 'archived' WHERE status = 2"
    remove_column :products, :status
    rename_column :products, :status_str, :status
  end
end
