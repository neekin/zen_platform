# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_07_182336) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "api_keys", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at"
    t.string "key"
    t.string "name"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["key"], name: "index_api_keys_on_key", unique: true
    t.index ["user_id"], name: "index_api_keys_on_user_id"
  end

  create_table "dictionaries", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "group", default: "default"
    t.string "key", null: false
    t.json "translations", default: {}
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_dictionaries_on_key", unique: true
  end

  create_table "exports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error_message"
    t.string "file_path"
    t.text "filters"
    t.string "format", null: false
    t.string "resource", null: false
    t.integer "row_count"
    t.string "status", default: "pending"
    t.datetime "updated_at", null: false
    t.integer "user_id"
    t.index ["status"], name: "index_exports_on_status"
    t.index ["user_id"], name: "index_exports_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "action", null: false
    t.integer "actor_id"
    t.datetime "created_at", null: false
    t.text "metadata"
    t.integer "notifiable_id"
    t.string "notifiable_type"
    t.boolean "read", default: false
    t.integer "recipient_id", null: false
    t.datetime "updated_at", null: false
    t.index ["actor_id"], name: "index_notifications_on_actor_id"
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable_type_and_notifiable_id"
    t.index ["recipient_id", "read"], name: "index_notifications_on_recipient_id_and_read"
    t.index ["recipient_id"], name: "index_notifications_on_recipient_id"
  end

  create_table "permissions", force: :cascade do |t|
    t.string "action_name", null: false
    t.boolean "allowed", default: true
    t.datetime "created_at", null: false
    t.string "field_action"
    t.string "field_name"
    t.string "resource", null: false
    t.string "role_name", null: false
    t.datetime "updated_at", null: false
    t.index ["role_name", "resource", "action_name"], name: "idx_permissions_role_resource_action", unique: true
    t.index ["role_name", "resource", "field_name"], name: "index_permissions_on_role_resource_field", unique: true
    t.index ["role_name"], name: "index_permissions_on_role_name"
  end

  create_table "roles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "resource_id"
    t.string "resource_type"
    t.datetime "updated_at", null: false
    t.index ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id"
    t.index ["name"], name: "index_roles_on_name"
    t.index ["resource_type", "resource_id"], name: "index_roles_on_resource"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.string "locale", default: "zh-CN", null: false
    t.string "name"
    t.text "note"
    t.string "password_digest"
    t.string "phone"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "users_roles", id: false, force: :cascade do |t|
    t.integer "role_id"
    t.integer "user_id"
    t.index ["role_id"], name: "index_users_roles_on_role_id"
    t.index ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id"
    t.index ["user_id"], name: "index_users_roles_on_user_id"
  end

  create_table "versions", force: :cascade do |t|
    t.datetime "created_at"
    t.string "event", null: false
    t.string "ip"
    t.bigint "item_id", null: false
    t.string "item_type", null: false
    t.text "metadata"
    t.text "object", limit: 1073741823
    t.text "object_changes", limit: 1073741823
    t.string "request_id"
    t.string "whodunnit"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
    t.index ["request_id"], name: "index_versions_on_request_id"
  end

  create_table "workflow_definitions", force: :cascade do |t|
    t.boolean "active", default: true
    t.json "allowed_roles"
    t.json "bpmn_definition", default: {}
    t.datetime "created_at", null: false
    t.text "description"
    t.json "form_config", default: {}
    t.string "key", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.integer "version", default: 1
    t.index ["key", "version"], name: "index_workflow_definitions_on_key_and_version", unique: true
  end

  create_table "workflow_histories", force: :cascade do |t|
    t.integer "action", default: 0
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "executed_at"
    t.string "node_id", null: false
    t.string "node_name"
    t.string "node_type"
    t.integer "operator_id"
    t.json "snapshot", default: {}
    t.datetime "updated_at", null: false
    t.integer "workflow_instance_id", null: false
    t.index ["action"], name: "index_workflow_histories_on_action"
    t.index ["operator_id"], name: "index_workflow_histories_on_operator_id"
    t.index ["workflow_instance_id", "executed_at"], name: "idx_on_workflow_instance_id_executed_at_a0a9b58c54"
    t.index ["workflow_instance_id"], name: "index_workflow_histories_on_workflow_instance_id"
  end

  create_table "workflow_instances", force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.json "current_nodes", default: []
    t.integer "initiator_id", null: false
    t.datetime "started_at"
    t.integer "status", default: 0
    t.datetime "updated_at", null: false
    t.json "variables", default: {}
    t.integer "workflow_definition_id", null: false
    t.index ["initiator_id"], name: "index_workflow_instances_on_initiator_id"
    t.index ["started_at"], name: "index_workflow_instances_on_started_at"
    t.index ["status"], name: "index_workflow_instances_on_status"
    t.index ["workflow_definition_id"], name: "index_workflow_instances_on_workflow_definition_id"
  end

  create_table "workflow_tasks", force: :cascade do |t|
    t.integer "assignee_id"
    t.json "candidate_roles", default: []
    t.json "candidate_users", default: []
    t.text "comment"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "due_date"
    t.json "form_data", default: {}
    t.string "node_id", null: false
    t.string "node_name"
    t.integer "status", default: 0
    t.integer "task_type", default: 0
    t.datetime "updated_at", null: false
    t.integer "workflow_instance_id", null: false
    t.index ["assignee_id"], name: "index_workflow_tasks_on_assignee_id"
    t.index ["due_date"], name: "index_workflow_tasks_on_due_date"
    t.index ["status"], name: "index_workflow_tasks_on_status"
    t.index ["workflow_instance_id", "node_id"], name: "index_workflow_tasks_on_workflow_instance_id_and_node_id"
    t.index ["workflow_instance_id"], name: "index_workflow_tasks_on_workflow_instance_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "api_keys", "users"
  add_foreign_key "exports", "users"
  add_foreign_key "notifications", "users", column: "actor_id"
  add_foreign_key "notifications", "users", column: "recipient_id"
  add_foreign_key "workflow_histories", "users", column: "operator_id"
  add_foreign_key "workflow_histories", "workflow_instances"
  add_foreign_key "workflow_instances", "users", column: "initiator_id"
  add_foreign_key "workflow_instances", "workflow_definitions"
  add_foreign_key "workflow_tasks", "users", column: "assignee_id"
  add_foreign_key "workflow_tasks", "workflow_instances"
end
