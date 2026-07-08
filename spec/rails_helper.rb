# frozen_string_literal: true

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rspec/rails"
require "rswag/specs"

RSpec.configure do |config|
  config.fixture_paths = [ Rails.root.join("test/fixtures") ]
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end

# 加载 support 目录下的辅助文件
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }
