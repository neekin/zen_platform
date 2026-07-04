# frozen_string_literal: true

module Zen
  class Configuration
    attr_accessor :app_name, :logo, :primary_color, :sidebar_mode

    def initialize
      @app_name = "Zen Platform"
      @logo = "/logo-mark.svg"
      @primary_color = "#D4A537"
      @sidebar_mode = :mix
    end
  end

  class << self
    attr_accessor :configuration

    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end
  end
end
