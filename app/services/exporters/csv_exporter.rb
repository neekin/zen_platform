# frozen_string_literal: true

require "csv"

module Exporters
  class CsvExporter
    def initialize(records, resource_name)
      @records = records
      @resource_name = resource_name
    end

    def generate
      columns = @records.column_names - %w[id created_at updated_at]
      timestamp = Time.current.strftime("%Y%m%d%H%M%S")
      file_path = Rails.root.join("storage", "exports", "#{@resource_name.underscore}_#{timestamp}.csv")

      FileUtils.mkdir_p(File.dirname(file_path))

      CSV.open(file_path, "wb") do |csv|
        csv << columns
        @records.find_each do |record|
          csv << columns.map { |col| record.send(col) }
        end
      end

      file_path.to_s
    end
  end
end
