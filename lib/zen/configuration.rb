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

  # 使用模块级实例变量，避免 class << self 的加载顺序问题
  @configuration = nil

  def self.configuration
    @configuration ||= Configuration.new
  end

  def self.configure
    yield(configuration)
  end
end
